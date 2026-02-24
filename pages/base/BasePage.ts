import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../../utils/logger';

export abstract class BasePage {
    protected readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate(path: string) {
        logger.info(`Navigating to ${path}`);
        await this.page.goto(path);
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
}
