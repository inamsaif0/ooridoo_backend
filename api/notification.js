'use strict';

const { Router } = require('express');
const {
    createNotification,
    getNotifications
} = require('../controller/notification');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const { upload } = require('../utils');

class NotificationAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.use(upload().none());

        router.get('/', authMiddleware(Object.values(ROLES)), getNotifications);
        router.post('/', authMiddleware(Object.values(ROLES)), createNotification);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/notification';
    }
}

module.exports = NotificationAPI;