import { test, expect } from '../../fixtures/testFixture';

test.describe('Dashboard Tests', () => {

    test.use({ storageState: undefined }); // Example of using fixtures or storage state

    test('should display dashboard correctly when logged in', async ({ loggedInPage, dashboardPage }) => {
        // Assert
        await dashboardPage.validateOnDashboard();
        expect(await dashboardPage.isWelcomeMessageVisible()).toBe(true);
    });

    test('should logout successfully', async ({ loggedInPage, dashboardPage, page }) => {
        // Act
        await dashboardPage.logout();

        // Assert
        await expect(page).toHaveURL(/.*login/);
    });
});
