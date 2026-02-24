import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { testData } from '../utils/testData';

type MyFixtures = {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    loggedInPage: Page;
};

export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },
    loggedInPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(testData.admin.username, testData.admin.password);
        await loginPage.validateLoginSuccess();
        await use(page);
    },
});

export { expect } from '@playwright/test';
import { Page } from '@playwright/test';
