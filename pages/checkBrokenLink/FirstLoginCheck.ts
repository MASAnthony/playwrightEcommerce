import { Page, Locator, expect, TestInfo } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { routes } from '../../config/routes';
import { logger } from '../../utils/logger';
import { testData } from '../../utils/testData';

export class FirstLoginCheck extends BasePage {
    private readonly loginLink: Locator;
    private readonly mobileInput: Locator;
    private readonly sendOtpButton: Locator;
    private readonly otpInputs: Locator;
    private readonly loginSubmit: Locator;
    private readonly selectButton: Locator;
    private readonly navToHealthPackages: Locator;
    private readonly addPackageButton: Locator;
    private readonly viewCartButton: Locator;
    private readonly reviewCartButton: Locator;
    private readonly memberSelection: Locator;
    private readonly paymentOption: Locator;
    private readonly confirmBookingButton: Locator;
    private readonly myBookingsButton: Locator;

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
        this.addPackageButton = page.getByRole('button', { name: 'Add', exact: true });
        this.viewCartButton = page.getByRole('button', { name: 'View Cart' });
        this.reviewCartButton = page.getByRole('button', { name: testData.expected.reviewCart });
        this.memberSelection = page.locator('.cursor-pointer.text-indigo-200');
        this.paymentOption = page.getByText(testData.expected.paymentOption);
        this.confirmBookingButton = page.getByRole('button', { name: testData.expected.confirmBooking });
        this.myBookingsButton = page.getByRole('button', { name: testData.expected.myBookings });
    }

    async navigateToHome(testInfo?: TestInfo) {
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
        await this.selectButton.nth(index).click();
        await expect(this.navToHealthPackages).toBeVisible();
        await this.navToHealthPackages.click();
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
}
