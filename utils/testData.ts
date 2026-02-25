import { envConfig } from '../config/envConfig';

export const testData = {
    admin: {
        username: envConfig.adminUsername,
        password: envConfig.adminPassword
    },
    user: {
        mobile: '9363564962',
        otp: '1111'
    },
    address: {
        search: 'siva',
        selection: 'Sivakasi',
        houseNo: '46',
        area: 'new',
        pincode: '626124'
    },
    expected: {
        comingSoonHeading: "We're Coming Soon!",
        comingSoonText: "We're Coming Soon!We're Sorry",
        cartUrlPart: 'cart',
        dashboardUrlPart: 'dashboard'
    }
};
