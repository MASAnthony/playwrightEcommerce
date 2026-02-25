import { test, expect } from '../../fixtures/testFixture';
import { testData } from '../../utils/testData';

test.describe('Home Sample Collection - First Login Flow', () => {
    // Extended timeout: link checks scan 80+ URLs in parallel; give ample time
    test.setTimeout(180_000);

    test('User can login and complete a fresh booking with broken link checks', async ({ firstLoginCheckPage, page }, testInfo) => {
        const { mobile, otp } = testData.user;

        await test.step('Navigate to application and check links', async () => {
            await firstLoginCheckPage.navigateToHome(testInfo);
            await expect(page).toHaveURL(/sterlingaccuris/);
            await firstLoginCheckPage.checkBrokenLinks(testInfo);
            await firstLoginCheckPage.checkBrokenImages(testInfo);
        });

        await test.step('Initiate login with mobile number', async () => {
            await firstLoginCheckPage.initiateLogin(mobile);
        });

        await test.step('Enter OTP and submit', async () => {
            await firstLoginCheckPage.enterOtpAndSubmit(otp);
        });

        await test.step('Select address and navigate to healthy packages', async () => {
            await firstLoginCheckPage.selectAddressAndNavigate(1);
            await firstLoginCheckPage.checkBrokenLinks(testInfo);
            await firstLoginCheckPage.checkBrokenImages(testInfo);
        });

        await test.step('Add package and view cart', async () => {
            await firstLoginCheckPage.addPackageAndViewCart();
        });

        await test.step('Select member and review cart', async () => {
            await firstLoginCheckPage.selectMemberAndReview();
        });

        await test.step('Choose payment and confirm booking', async () => {
            await firstLoginCheckPage.choosePaymentAndConfirm();
            await firstLoginCheckPage.checkBrokenLinks(testInfo);
            await firstLoginCheckPage.checkBrokenImages(testInfo);
        });

        await test.step('Verify booking success and view bookings', async () => {
            await firstLoginCheckPage.viewMyBookings();
            await firstLoginCheckPage.checkBrokenLinks(testInfo);
            await firstLoginCheckPage.checkBrokenImages(testInfo);
        });
    });
});
