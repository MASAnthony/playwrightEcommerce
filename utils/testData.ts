import { envConfig } from '../config/envConfig';

export const testData = {
    admin: {
        username: envConfig.adminUsername,
        password: envConfig.adminPassword
    },
    sampleUser: {
        username: 'Admin',
        password: 'Test@123',
        email: 'sample@example.com'
    }
};
