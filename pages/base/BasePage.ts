import { Page, Locator, expect, TestInfo } from '@playwright/test';
import { logger } from '../../utils/logger';
import { LinkCheckResult, attachPageLoadTime, attachLinkCheckResults } from '../../utils/reportMetrics';

export abstract class BasePage {
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigates to a path and optionally records page load time for the report.
     */
    async navigate(path: string, testInfo?: TestInfo) {
        logger.info(`Navigating to ${path}`);
        const start = Date.now();
        await this.page.goto(path);
        await this.page.waitForLoadState('domcontentloaded');
        const durationMs = Date.now() - start;

        if (testInfo) {
            attachPageLoadTime(testInfo, path, durationMs);
        }
        logger.info(`Page loaded in ${durationMs}ms`);
    }

    async click(locator: Locator | string) {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        logger.info(`Clicking element: ${element}`);
        await element.click();
    }

    async fill(locator: Locator | string, value: string) {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        logger.info(`Filling element with value: ${value}`);
        await element.fill(value);
    }

    async getText(locator: Locator | string): Promise<string> {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        const text = await element.innerText();
        logger.info(`Got text: ${text}`);
        return text;
    }

    async waitForVisible(locator: Locator | string) {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        logger.info(`Waiting for element to be visible`);
        await expect(element).toBeVisible();
    }

    async getTitle(): Promise<string> {
        return await this.page.title();
    }

    // Domains that block automated requests (social media, etc.) — skipped gracefully
    private readonly SKIP_DOMAINS = [
        'facebook.com', 'linkedin.com', 'instagram.com',
        'twitter.com', 'x.com', 'youtube.com'
    ];

    private isSkippedDomain(url: string): boolean {
        return this.SKIP_DOMAINS.some(domain => url.includes(domain));
    }

    /**
     * Run an array of async tasks in batches to avoid hitting the test timeout.
     */
    private async runInBatches<T>(tasks: (() => Promise<T>)[], batchSize = 5): Promise<T[]> {
        const results: T[] = [];
        for (let i = 0; i < tasks.length; i += batchSize) {
            const batch = tasks.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(t => t()));
            results.push(...batchResults);
        }
        return results;
    }

    /**
     * Checks all anchor tags on the current page in parallel batches.
     * Social media domains are skipped. Each request has a 5s timeout.
     * If testInfo is provided, results are attached to the Ortoni/HTML report.
     */
    async checkBrokenLinks(testInfo?: TestInfo) {
        logger.info('Checking for broken links...');
        await this.page.waitForLoadState('domcontentloaded');

        // Collect all hrefs upfront before any async requests
        const linkLocators = await this.page.locator('a').all();
        const hrefs: string[] = [];
        for (const link of linkLocators) {
            const href = await link.getAttribute('href');
            if (!href || href.startsWith('javascript:') || href.startsWith('#') ||
                href.startsWith('tel:') || href.startsWith('mailto:')) continue;
            hrefs.push(new URL(href, this.page.url()).href);
        }

        const skipped = hrefs.filter(h => this.isSkippedDomain(h));
        const toCheck = hrefs.filter(h => !this.isSkippedDomain(h));
        logger.info(`Found ${hrefs.length} links | Checking: ${toCheck.length} | Skipped (social media): ${skipped.length}`);

        const tasks = toCheck.map(href => async (): Promise<LinkCheckResult> => {
            try {
                const response = await this.page.request.get(href, { timeout: 5000 });
                const status = response.status();
                if (status >= 400) logger.error(`Broken link: ${href} (Status: ${status})`);
                return { url: href, status, type: 'link' };
            } catch (error: any) {
                logger.error(`Error checking link ${href}: ${error.message}`);
                return { url: href, status: 'error', type: 'link', error: error.message };
            }
        });

        const results = await this.runInBatches(tasks, 5);
        const broken = results.filter(r => r.status === 'error' || (r.status as number) >= 400);

        logger.info(`Finished checking ${toCheck.length} links.`);
        broken.length > 0
            ? logger.warn(`Summary: Found ${broken.length} broken links.`)
            : logger.info('Success: No broken links detected.');

        if (testInfo) await attachLinkCheckResults(testInfo, results, 'Links');
        return broken.map(r => r.url);
    }

    /**
     * Checks all images on the current page in parallel batches.
     * Each request has a 5s timeout.
     * If testInfo is provided, results are attached to the Ortoni/HTML report.
     */
    async checkBrokenImages(testInfo?: TestInfo) {
        logger.info('Checking for broken images...');
        await this.page.waitForLoadState('domcontentloaded');

        // Collect all srcs upfront
        const imgLocators = await this.page.locator('img').all();
        const srcs: string[] = [];
        for (const img of imgLocators) {
            const src = await img.getAttribute('src');
            if (!src || src.startsWith('data:')) continue;
            srcs.push(new URL(src, this.page.url()).href);
        }
        logger.info(`Found ${srcs.length} images to check`);

        const tasks = srcs.map(src => async (): Promise<LinkCheckResult> => {
            try {
                const response = await this.page.request.get(src, { timeout: 5000 });
                const status = response.status();
                if (status >= 400) logger.error(`Broken image: ${src} (Status: ${status})`);
                return { url: src, status, type: 'image' };
            } catch (error: any) {
                logger.error(`Error checking image ${src}: ${error.message}`);
                return { url: src, status: 'error', type: 'image', error: error.message };
            }
        });

        const results = await this.runInBatches(tasks, 5);
        const broken = results.filter(r => r.status === 'error' || (r.status as number) >= 400);

        logger.info(`Finished checking ${srcs.length} images.`);
        broken.length > 0
            ? logger.warn(`Summary: Found ${broken.length} broken images.`)
            : logger.info('Success: No broken images detected.');

        if (testInfo) await attachLinkCheckResults(testInfo, results, 'Images');
        return broken.map(r => r.url);
    }
}
