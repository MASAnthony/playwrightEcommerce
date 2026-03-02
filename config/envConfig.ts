export const envConfig = {
    baseUrl: process.env.BASE_URL || '',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'password123',
    timeout: {
        short: 5000,
        medium: 15000,
        long: 30000
    }
};
