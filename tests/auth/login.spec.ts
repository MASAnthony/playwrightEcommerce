import { test, expect } from '../../fixtures/testFixture';
import { testData } from '../../utils/testData';

test.describe('Authentication - Login', () => {

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate();
    });

    test('should login successfully with valid credentials', async ({ loginPage, dashboardPage }) => {
        // Arrange
        const { username, password } = testData.admin;

        // Act
        await loginPage.login(username, password);

        // Assert
        await dashboardPage.validateOnDashboard();
    });

    test('should show error message with invalid credentials', async ({ loginPage }) => {
        // Arrange
        const username = 'invalidUser';
        const password = 'invalidPassword';

        // Act
        await loginPage.login(username, password);

        // Assert
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Invalid credentials'); // Assuming this error message
    });
});
