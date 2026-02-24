import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { routes } from '../../config/routes';
import { logger } from '../../utils/logger';

export class LoginPage extends BasePage {
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('#username');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('button[type="submit"]');
        this.errorMessage = page.locator('.error-message');
    }

    async navigate() {
        await super.navigate(routes.login);
    }

    async login(username: string, password: string) {
        logger.info(`Logging in with username: ${username}`);
        await this.fill(this.usernameInput, username);
        await this.fill(this.passwordInput, password);
        await this.click(this.loginButton);
    }

    async validateLoginSuccess() {
        logger.info('Validating login success');
        await expect(this.page).toHaveURL(/.*dashboard/);
    }

    async getErrorMessage(): Promise<string> {
        return await this.getText(this.errorMessage);
    }
}
