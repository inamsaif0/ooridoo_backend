'use strict';

const router = require('express').Router();
const { upload } = require('../utils');
const { sendRequest, getPropertyRequestss,acceptRejectRequest, cancleRequest, getMyRequests, getPropertyRequests, getMyTenant } = require('../controller/request');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const {handleMultipartData} = require('../utils/multipart')

class REQUEST_API {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        
        // Add property
        router.post('/send-property-request', authMiddleware(ROLES), sendRequest);

        router.post('/accept-reject-request', authMiddleware(ROLES), acceptRejectRequest);

        router.post('/cancel-request', authMiddleware(ROLES), cancleRequest);
        
        router.get('/get-property-request-by-owner', authMiddleware(ROLES), getPropertyRequestss);
        // Get all properties by user ID
        router.get('/get-property-by-owner', authMiddleware(ROLES), getPropertyRequests);

        router.get('/get-my-requests', authMiddleware(ROLES), getMyRequests);

        // Update property
        router.get('/get-my-tenant', authMiddleware(ROLES), getMyTenant);


        // Delete property
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/request';
    }
}

module.exports = REQUEST_API;
