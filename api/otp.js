'use strict';

const router = require('express').Router();
const { generateOTP, verifyOTP } = require('../controller/otp');
const { upload } = require('../utils');

class OTP_API {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.use(upload().none());

        router.post('/generate', generateOTP);
        router.post('/verify', verifyOTP);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/otp';
    }
}

module.exports = OTP_API;