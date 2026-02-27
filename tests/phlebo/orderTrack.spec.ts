import { test, expect } from '../../fixtures/testFixture';
import { testData } from '../../utils/testData';

test.describe('Phlebo Order Tracking - Full Booking and Track Flow', () => {
  // Booking flow + up to 2 min waiting for phlebo acceptance via API polling
  test.setTimeout(300_000);

  test('User can login, complete a fresh booking, and verify order tracking details', async ({ orderTrackPage, page }, testInfo) => {
    const { mobile, otp } = testData.user;

    await test.step('Navigate to application', async () => {
      await orderTrackPage.navigateToHome(testInfo);
      await expect(page).toHaveURL(/sterlingaccuris/);
    });

    await test.step('Initiate login with mobile number', async () => {
      await orderTrackPage.initiateLogin(mobile);
    });

    await test.step('Enter OTP and submit', async () => {
      await orderTrackPage.enterOtpAndSubmit(otp);
    });

    await test.step('Select address and navigate to healthy packages', async () => {
      await orderTrackPage.selectAddressAndNavigate(1);
    });

    await test.step('Add package and view cart', async () => {
      await orderTrackPage.addPackageAndViewCart();
    });

    await test.step('Select member and review cart', async () => {
      await orderTrackPage.selectMemberAndReview();
    });

    await test.step('Choose payment and confirm booking', async () => {
      await orderTrackPage.choosePaymentAndConfirm();
    });

    await test.step('View My Bookings', async () => {
      await orderTrackPage.viewMyBookings();
    });

    await test.step('Open order tracking panel', async () => {
      await orderTrackPage.openTrackOrder();
    });

    await test.step('Wait for phlebo to accept the order (API polling)', async () => {
      // Polls GET /visit/enriched/{orderId} every 8s until phlebo_id is non-null.
      // Accept the order via the phlebo app — this step waits automatically (up to 2 min).
      await orderTrackPage.waitForOrderAcceptance(120_000);
    });

    await test.step('Verify order tracking details', async () => {
      await orderTrackPage.verifyOrderTrackingDetails();
    });
  });
});