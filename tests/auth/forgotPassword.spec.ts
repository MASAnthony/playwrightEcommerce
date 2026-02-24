import { test, expect } from '../../fixtures/testFixture';

test.describe('Authentication - Forgot Password', () => {

    test('should navigate to forgot password page', async ({ page }) => {
        // Act
        await page.goto('/login');
        await page.click('text=Forgot password?');

        // Assert
        await expect(page).toHaveURL(/.*forgot-password/);
    });
});
