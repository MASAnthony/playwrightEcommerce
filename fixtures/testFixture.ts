import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { LocationPage } from '../pages/auth/LocationPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { FirstLoginCheck } from '../pages/checkBrokenLink/FirstLoginCheck';
import { OrderTrackPage } from '../pages/phlebo/OrderTrackPage';
import { testData } from '../utils/testData';

type MyFixtures = {
    loginPage: LoginPage;
    locationPage: LocationPage;
    dashboardPage: DashboardPage;
    firstLoginCheckPage: FirstLoginCheck;
    orderTrackPage: OrderTrackPage;
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
    firstLoginCheckPage: async ({ page }, use) => {
        await use(new FirstLoginCheck(page));
    },
    orderTrackPage: async ({ page }, use) => {
        await use(new OrderTrackPage(page));
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
