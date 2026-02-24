import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { routes } from '../../config/routes';
import { logger } from '../../utils/logger';

export class DashboardPage extends BasePage {
    private readonly welcomeMessage: Locator;
    private readonly logoutButton: Locator;

    constructor(page: Page) {
        super(page);
        this.welcomeMessage = page.locator('h1:has-text("Welcome")');
        this.logoutButton = page.locator('text=Logout');
    }

    async navigate() {
        await super.navigate(routes.dashboard);
    }

    async isWelcomeMessageVisible(): Promise<boolean> {
        return await this.welcomeMessage.isVisible();
    }

    async logout() {
        logger.info('Logging out');
        await this.click(this.logoutButton);
    }

    async validateOnDashboard() {
        logger.info('Validating on dashboard');
        await expect(this.page).toHaveURL(/.*dashboard/);
        await expect(this.welcomeMessage).toBeVisible();
    }
}
