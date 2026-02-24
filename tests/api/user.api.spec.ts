import { test, expect } from '@playwright/test';
import { routes } from '../../config/routes';

test.describe('API Testing - User API', () => {

    test('should fetch user list successfully', async ({ request }) => {
        // Act
        const response = await request.get(routes.api.users);

        // Assert
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
        // Assuming the response is an array of users
    });

    test('should fetch single user details', async ({ request }) => {
        // Act
        const response = await request.get(`${routes.api.users}/1`);

        // Assert
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('id');
    });
});
