import { Page, Locator, expect, TestInfo } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { routes } from '../../config/routes';
import { logger } from '../../utils/logger';
import { testData } from '../../utils/testData';

export class OrderTrackPage extends BasePage {
    private readonly loginLink: Locator;
    private readonly mobileInput: Locator;
    private readonly sendOtpButton: Locator;
    private readonly otpInputs: Locator;
    private readonly loginSubmit: Locator;
    private readonly selectButton: Locator;
    private readonly navToHealthPackages: Locator;
    private readonly cancelButton: Locator;
    private readonly addPackageButton: Locator;
    private readonly viewCartButton: Locator;
    private readonly memberSelection: Locator;
    private readonly reviewCartButton: Locator;
    private readonly paymentOption: Locator;
    private readonly confirmBookingButton: Locator;
    private readonly myBookingsButton: Locator;
    private readonly trackOrderIcon: Locator;
    private readonly assigningHeading: Locator;
    private readonly etaText: Locator;
    private readonly openingOtpText: Locator;
    private readonly phleboPartnerText: Locator;

    // Captured from outgoing API requests — populated automatically after first authenticated call
    private capturedAuthToken: string | null = null;

    constructor(page: Page) {
        super(page);
        this.loginLink = page.getByRole('button', { name: 'Login' });
        this.mobileInput = page.getByRole('textbox', { name: 'Mobile Number *' });
        this.sendOtpButton = page.getByRole('button', { name: 'Send OTP' });
        // Specific filter to avoid search boxes if they exist
        this.otpInputs = page.getByRole('textbox').filter({
            hasNot: page.getByRole('textbox', { name: /search/i })
        });
        this.loginSubmit = page.getByRole('button', { name: 'Login' });
        this.selectButton = page.getByRole('button', { name: 'Select' });
        this.navToHealthPackages = page.getByRole('button', { name: testData.expected.navToHealthPackages });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.addPackageButton = page.getByRole('button', { name: 'Add', exact: true });
        this.viewCartButton = page.getByRole('button', { name: 'View Cart' });
        this.memberSelection = page.locator('.cursor-pointer.text-indigo-200');
        this.reviewCartButton = page.getByRole('button', { name: testData.expected.reviewCart });
        this.paymentOption = page.getByText(testData.expected.paymentOption);
        this.confirmBookingButton = page.getByRole('button', { name: testData.expected.confirmBooking });
        this.myBookingsButton = page.getByRole('button', { name: testData.expected.myBookings });
        this.trackOrderIcon = page.locator('.w-6.h-6.text-gray-600');
        this.assigningHeading = page.getByRole('heading', { name: 'Assigning to a nearest', exact: true });
        // ETA text is a map overlay with dynamic value e.g. "ETA: 7 min" — match with regex
        this.etaText = page.getByText(/ETA:/);
        this.openingOtpText = page.getByText('Opening OTP', { exact: true });
        this.phleboPartnerText = page.getByText('Phlebo partner', { exact: true });
    }

    /**
     * Passively listens to all outgoing API requests and captures the Bearer token
     * the first time it appears. This avoids any need for hardcoded credentials.
     */
    private setupAuthCapture(): void {
        this.page.on('request', (request) => {
            if (this.capturedAuthToken) return; // already captured
            if (!request.url().includes('sterlingaccuris.com/api/')) return;
            const auth = request.headers()['authorization'];
            if (auth && auth.startsWith('Bearer ')) {
                this.capturedAuthToken = auth;
                logger.info('Auth token captured from outgoing API request');
            }
        });
    }

    async navigateToHome(testInfo?: TestInfo) {
        this.setupAuthCapture(); // wire up before first navigation
        await super.navigate(routes.home, testInfo);
        await expect(this.page).toHaveURL(/sterlingaccuris/);
    }

    async initiateLogin(mobile: string) {
        logger.info(`Initiating login for ${mobile}`);
        await this.loginLink.first().click();
        await expect(this.mobileInput).toBeVisible();
        await this.mobileInput.click();
        await this.mobileInput.fill(mobile);
        await this.sendOtpButton.click();
    }

    async enterOtpAndSubmit(otp: string) {
        logger.info(`Entering OTP and submitting`);
        await expect(this.otpInputs).toHaveCount(4, { timeout: 15000 });
        const digits = otp.split('');
        for (let i = 0; i < digits.length; i++) {
            await this.otpInputs.nth(i).fill(digits[i]);
        }
        await this.loginSubmit.click();

        // Wait a moment for server response to settle (OTP validation is async)
        await this.page.waitForTimeout(2000);

        // Now check if the OTP was rejected
        const otpError = this.page.getByText(/invalid otp|please try again/i).first();
        if (await otpError.isVisible()) {
            const errorText = await otpError.innerText();
            logger.error(`OTP rejected by server: "${errorText}" — Update testData.ts otp value`);
            throw new Error(`Invalid OTP entered: "${otp}". Server responded: "${errorText}"`);
        }

        logger.info('OTP accepted, proceeding...');
    }

    async selectAddressAndNavigate(index: number = 1) {
        logger.info(`Selecting address at index ${index} and navigating to health packages`);
        await expect(this.selectButton.nth(index)).toBeVisible({ timeout: 20000 });
        // In CI (headless), the modal overlay container (fixed inset-0 z-70) intercepts pointer events
        // even though the Select button inside it is visible and enabled.
        // force:true bypasses the interception check since the element is confirmed ready.
        await this.selectButton.nth(index).click({ force: true });
        await expect(this.navToHealthPackages).toBeVisible();
        await this.navToHealthPackages.click();
        // Cancel dialog if it appears after navigating to health packages
        const isCancelVisible = await this.cancelButton.isVisible();
        if (isCancelVisible) {
            logger.info('Cancel dialog detected, dismissing');
            await this.cancelButton.click();
        }
    }

    async addPackageAndViewCart() {
        logger.info('Checking if package needs to be added');
        const firstAddBtn = this.addPackageButton.first();
        const addedBtn = this.page.getByRole('button', { name: 'Added' }).first();

        if (await addedBtn.isVisible()) {
            logger.info('Package already added (button shows "Added"), skipping click');
        } else {
            logger.info('Adding first package');
            await firstAddBtn.click();
        }
        await this.viewCartButton.click();
        await expect(this.reviewCartButton).toBeVisible();
    }

    async selectMemberAndReview() {
        logger.info('Selecting first member and clicking review cart');
        await this.memberSelection.first().click();
        await this.reviewCartButton.click();
    }

    async choosePaymentAndConfirm() {
        logger.info('Choosing payment and confirming booking');
        await expect(this.paymentOption).toBeVisible();
        await this.paymentOption.click();
        await this.confirmBookingButton.click();
    }

    async viewMyBookings() {
        logger.info('Viewing My Bookings');
        await expect(this.myBookingsButton).toBeVisible({ timeout: 15000 });
        await this.myBookingsButton.click();
    }

    async openTrackOrder() {
        logger.info('Opening order tracking panel');
        await expect(this.trackOrderIcon.first()).toBeVisible({ timeout: 15000 });
        await this.trackOrderIcon.first().click();
    }

    /**
     * Extracts the current booking's order ID (format: SO + digits) from the page.
     * Tries the URL first, then scans visible page content.
     */
    private async extractCurrentOrderId(): Promise<string> {
        // 1. Try URL
        const urlMatch = this.page.url().match(/SO\d+/);
        if (urlMatch) {
            logger.info(`Order ID found in URL: ${urlMatch[0]}`);
            return urlMatch[0];
        }

        // 2. Try visible page text (order IDs rendered as SO<digits>)
        const textMatch = await this.page.evaluate(() => {
            const m = document.body.innerText.match(/SO\d+/);
            return m ? m[0] : null;
        });
        if (textMatch) {
            logger.info(`Order ID found in page text: ${textMatch}`);
            return textMatch;
        }

        throw new Error(
            'Could not extract order ID from the current page. ' +
            'Ensure the My Bookings page displays the order ID (SO...) in the page text or URL.'
        );
    }

    /**
     * Polls the visit enriched API until the booking has been accepted by a phlebo
     * (i.e., phlebo_id transitions from null to a valid UUID).
     *
     * The auth token is captured automatically from the browser's own API calls.
     * The order ID is extracted from the current page.
     *
     * @param timeoutMs  Maximum time to wait (default 2 minutes)
     * @param intervalMs Poll interval (default 8 seconds)
     */
    async waitForOrderAcceptance(
        timeoutMs: number = 120_000,
        intervalMs: number = 8_000
    ): Promise<void> {
        logger.info(`Waiting up to ${timeoutMs / 1000}s for a phlebo to accept the order...`);

        if (!this.capturedAuthToken) {
            throw new Error(
                'Auth token has not been captured yet. ' +
                'Ensure navigateToHome() was called before this step so the listener is active.'
            );
        }

        const orderId = await this.extractCurrentOrderId();
        const apiUrl =
            `https://staging-api.sterlingaccuris.com/api/v1/booking/internal/visit/enriched/${orderId}`;

        logger.info(`Polling: GET ${apiUrl}`);

        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            try {
                const response = await this.page.request.get(apiUrl, {
                    headers: { authorization: this.capturedAuthToken },
                    timeout: 10_000,
                });

                if (response.ok()) {
                    const body = await response.json();
                    const visit = body?.data?.visits?.[0];
                    const phleboId: string | null = visit?.phlebo_id ?? null;
                    const status: string = visit?.status ?? 'UNKNOWN';

                    logger.info(`Order status: ${status} | phlebo_id: ${phleboId ?? 'null (not yet accepted)'}`);

                    if (phleboId) {
                        logger.info(
                            `Order accepted! Assigned to: ${visit?.phleboName ?? 'unknown'} (${phleboId})`
                        );
                        return; // success — proceed to UI verification
                    }
                } else {
                    logger.warn(`API poll returned HTTP ${response.status()} — will retry`);
                }
            } catch (err: any) {
                logger.warn(`API poll request failed: ${err.message} — will retry`);
            }

            const elapsed = Math.round((Date.now() - startTime) / 1000);
            logger.info(`Not yet accepted (${elapsed}s elapsed). Next poll in ${intervalMs / 1000}s...`);
            await this.page.waitForTimeout(intervalMs);
        }

        throw new Error(
            `Order "${orderId}" was not accepted by a phlebo within ${timeoutMs / 1000}s. ` +
            'Please ensure the phlebo app accepts the booking and re-run the test.'
        );
    }

    async verifyOrderTrackingDetails() {
        logger.info('Verifying order tracking details');
        await expect(this.assigningHeading).toBeVisible({ timeout: 15000 });
        // ETA is a map overlay that loads asynchronously after map tiles — give it extra time
        await expect(this.etaText.first()).toBeVisible({ timeout: 10000 });
        await expect(this.openingOtpText).toBeVisible();
        await expect(this.phleboPartnerText).toBeVisible();
    }
}
