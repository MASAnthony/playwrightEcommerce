import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { LocationPage } from '../pages/auth/LocationPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { testData } from '../utils/testData';

type MyFixtures = {
    loginPage: LoginPage;
    locationPage: LocationPage;
    dashboardPage: DashboardPage;
    loggedInPage: Page;
};

export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    locationPage: async ({ page }, use) => {
        await use(new LocationPage(page));
    },
    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },
    loggedInPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.completeLogin(testData.user.mobile, testData.user.otp);
        await use(page);
    },
});

export { expect } from '@playwright/test';
import { Page } from '@playwright/test';
