import { test, expect } from '../../fixtures/testFixture';
import { testData } from '../../utils/testData';

test.describe('Authentication and Location Flows', () => {

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate();
    });

    test('Login and add new address', async ({ loginPage, locationPage, page }) => {
        // Arrange
        const { mobile, otp } = testData.user;
        const { address, expected } = testData;

        // Act
        await test.step('Perform Login', async () => {
            await loginPage.completeLogin(mobile, otp);
        });

        await test.step('Search and Select Location', async () => {
            await locationPage.searchAndSelectLocation(address.search, address.selection);
        });

        await test.step('Confirm Location and Fill Form', async () => {
            // Recording shows confirming twice after selection
            await locationPage.confirmLocationAction();
            await locationPage.confirmLocationAction();

            await locationPage.fillAddressDetails({
                houseNo: address.houseNo,
                area: address.area,
                pincode: address.pincode
            });

            await locationPage.confirmLocationAction();
        });

        // Assert
        await test.step('Verify Success Outcome', async () => {
            // Success is either Coming Soon message or View Cart button appears
            const comingSoonOrCart = page.locator(`text="${expected.comingSoonHeading}"`).or(page.getByRole('button', { name: 'View Cart' }));
            await expect(comingSoonOrCart.first()).toBeVisible({ timeout: 15000 });
        });
    });

    test('Login and use current location', async ({ loginPage, locationPage, page }) => {
        // Arrange
        const { mobile, otp } = testData.user;

        // Act
        await test.step('Perform Login', async () => {
            await loginPage.completeLogin(mobile, otp);
        });

        await test.step('Select Current Location', async () => {
            await locationPage.selectCurrentLocation();
        });

        // Assert
        await test.step('Verify Coming Soon Message or Dashboard', async () => {
            await locationPage.validateComingSoonMessage();
        });
    });

    test('Login and select existing address', async ({ loginPage, locationPage, page }) => {
        // Arrange
        const { mobile, otp } = testData.user;

        // Act
        await test.step('Perform Login', async () => {
            await loginPage.completeLogin(mobile, otp);
        });

        await test.step('Select Existing Address and View Cart', async () => {
            await locationPage.selectExistingAddress(1);
            await locationPage.viewCart();
        });

        // Assert
        await test.step('Verify Cart Page or Redirection', async () => {
            // Adjust assertion based on where View Cart leads
            await expect(page).toHaveURL(new RegExp(`.*${testData.expected.cartUrlPart}`));
        });
    });
});