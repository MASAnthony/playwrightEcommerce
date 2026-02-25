import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import * as os from 'os';
import type { OrtoniReportConfig } from 'ortoni-report';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config();

const ortoniConfig: OrtoniReportConfig = {
    folderPath: 'ortoni-report',
    filename: 'ortoni-report.html',
    title: 'Sterling Accuris - Automation Report',
    projectName: 'Playwright Automation Framework',
    testType: 'E2E / Broken Link',
    authorName: os.userInfo().username,
    base64Image: false,
    stdIO: true,
    meta: {
        'Test Cycle': new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' }),
        'Environment': 'Staging QC',
        'Platform': os.type(),
        'Base URL': process.env.BASE_URL || 'https://staging-qc.sterlingaccuris.com'
    }
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    /* Maximum time one test can run for. */
    timeout: 60 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toBeVisible();`
         */
        timeout: 5000
    },
    /* Run tests in files in parallel */
    fullyParallel: false,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    /* Opt out of parallel tests on CI. Run tests sequentially locally to save system resources. */
    workers: 1,

    /* Opt out of parallel tests on CI. */
    // workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html'],
        ['ortoni-report', ortoniConfig]
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.BASE_URL || 'https://staging-qc.sterlingaccuris.com',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // {
        //     name: 'firefox',
        //     use: { ...devices['Desktop Firefox'] },
        // },

        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] },
        // },
    ],
});
