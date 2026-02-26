import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { routes } from '../../config/routes';
import { logger } from '../../utils/logger';

export class LoginPage extends BasePage {
    private readonly loginButton: Locator;
    private readonly mobileInput: Locator;
    private readonly sendOtpButton: Locator;
    private readonly otpInputs: Locator;
    private readonly submitLogin: Locator;

    constructor(page: Page) {
        super(page);
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.mobileInput = page.getByRole('textbox', { name: 'Mobile Number *' });
        this.sendOtpButton = page.getByRole('button', { name: 'Send OTP' });
        // Targeted locator for OTP inputs to avoid selecting the search box if present
        // this.otpInputs = page.getByRole('textbox').filter({
        //     hasNot: page.getByRole('textbox', { name: /search/i })
        // });
        // More specific locator for OTP inputs to avoid conflicts in CI
        this.otpInputs = page.locator('input[type="text"]').filter({
            hasNot: page.getByRole('textbox', { name: /search|mobile/i })
        });
        this.submitLogin = page.getByRole('button', { name: 'Login' });
    }

    async navigate() {
        await super.navigate(routes.login);
        await expect(this.page).toHaveURL(/sterlingaccuris/);
    }

    async enterMobile(number: string) {
        logger.info(`Entering mobile number: ${number}`);
        await this.mobileInput.click();
        await this.mobileInput.fill(number);
    }

    async sendOtp() {
        logger.info('Clicking Send OTP');
        await this.sendOtpButton.click();
    }

    async enterOTP(otp: string) {
        logger.info(`Entering OTP: ${otp}`);
        const digits = otp.split('');

        // Wait for the mobile screen to transition to the 4 OTP boxes
        // We wait for the mobile input to be hidden or for the count to reach exactly 4 (as per user's recording)
        // If there's a search box, it might be 5, but let's stick to the user's confirmed "toHaveCount(4)" for now
        // but with a bit more robustness.
        try {
            // Wait for mobile input to be hidden to ensure we are on OTP screen
            await this.mobileInput.waitFor({ state: 'hidden', timeout: 10000 });
            await expect(this.otpInputs).toHaveCount(4, { timeout: 15000 });
        } catch (error) {
            const count = await this.otpInputs.count();
            logger.error(`Failed to find 4 OTP boxes. Current count: ${count}`);

            // Check for any visible error message that might have prevented the transition
            const errorMsg = this.page.locator('text=/invalid|error|required/i').first();
            if (await errorMsg.isVisible()) {
                const text = await errorMsg.innerText();
                logger.error(`App Error: ${text}`);
            }
            throw error;
        }

        for (let i = 0; i < digits.length; i++) {
            await this.otpInputs.nth(i).fill(digits[i]);
        }
    }

    async completeLogin(number: string, otp: string) {
        logger.info(`Starting login flow for ${number}`);
        await this.loginButton.first().click();
        await this.enterMobile(number);
        await this.sendOtp();
        await this.enterOTP(otp);
        await this.submitLogin.click();
    }

    async validateLoginSuccess() {
        logger.info('Validating login success');
        await expect(this.page).toHaveURL(/.*dashboard/);
    }
}
