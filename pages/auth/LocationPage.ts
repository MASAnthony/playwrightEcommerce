import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { logger } from '../../utils/logger';
import { testData } from '../../utils/testData';

export class LocationPage extends BasePage {
    private readonly useCurrentLocation: Locator;
    private readonly confirmLocation: Locator;
    private readonly addNewAddress: Locator;
    private readonly selectButton: Locator;
    private readonly searchInput: Locator;
    private readonly houseNoInput: Locator;
    private readonly areaInput: Locator;
    private readonly pincodeInput: Locator;

    constructor(page: Page) {
        super(page);
        this.useCurrentLocation = page.getByText('Use Current Location');
        this.confirmLocation = page.getByRole('button', { name: 'Confirm Location' });
        this.addNewAddress = page.getByText('Add New Address');
        this.selectButton = page.getByRole('button', { name: 'Select' });

        // New Address Form Locators
        this.searchInput = page.getByRole('textbox', { name: 'Search for area, street name' });
        this.houseNoInput = page.getByRole('textbox', { name: 'House/Flat/Floor No.*' });
        this.areaInput = page.getByRole('textbox', { name: 'Apartment/Road/Area*' });
        this.pincodeInput = page.getByRole('textbox', { name: 'Pincode*' });
    }

    async searchAndSelectLocation(location: string, selectText: string) {
        logger.info(`Searching for area: ${location}`);
        await this.searchInput.click();
        await this.searchInput.fill(location);
        await this.page.getByText(selectText, { exact: false }).first().click();
    }

    async confirmLocationAction() {
        logger.info('Confirming location');
        await this.confirmLocation.click();
    }

    async fillAddressDetails(details: { houseNo: string, area: string, pincode: string }) {
        logger.info(`Filling address details: ${JSON.stringify(details)}`);
        await this.houseNoInput.fill(details.houseNo);
        await this.areaInput.fill(details.area);
        await this.pincodeInput.fill(details.pincode);
    }

    async validateComingSoonMessage() {
        logger.info('Validating Coming Soon message');
        const comingSoonHeading = this.page.getByRole('heading', { name: testData.expected.comingSoonHeading });
        await expect(comingSoonHeading).toBeVisible();
    }

    async selectCurrentLocation() {
        logger.info('Selecting current location');
        await this.useCurrentLocation.click();
        await this.confirmLocation.click();
    }

    async selectExistingAddress(index: number = 1) {
        logger.info(`Selecting existing address at index ${index}`);
        await this.selectButton.nth(index).click();
    }

    async viewCart() {
        logger.info('Clicking View Cart');
        const viewCartButton = this.page.getByRole('button', { name: 'View Cart' });
        await viewCartButton.click();
    }

    async addNewAddressFlow() {
        logger.info('Starting add new address flow - Skipping redundant clicks');
        // We skip the direct Add New Address and Select clicks as they might trigger GPS
        // as per user instruction: "do not click Use Current location for Add new Address"
    }
}
