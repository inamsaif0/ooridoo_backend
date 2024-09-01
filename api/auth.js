'use strict';

const { Router } = require('express')
const { register, login ,verifyToken, addGuest} = require('../controller/user');
const { upload } = require('../utils');

class AuthAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        // router.use(upload().none());
        router.post('/register', upload('users').single('image'), register);
        router.post('/login', upload().none(), login);
        router.post('/verifyToken', upload().none(), verifyToken);
        router.post('/add-guest', upload().none(), addGuest)


    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/auth';
    }
}

module.exports = AuthAPI; 