'use strict';

const router = require('express').Router();
const { upload } = require('../utils');
const { createProperty, getAllPropertiesByUserId, updateProperty, deleteProperty, filterProperties, getHomeScreenPropertiesForTenant } = require('../controller/property');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const {handleMultipartData} = require('../utils/multipart')

class PROPERTY_API {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        
        // Add property
        router.post('/add-property', authMiddleware(ROLES.OWNER), handleMultipartData.fields([{ name: 'media', maxCount: 100 }]), createProperty);

        router.post('/get-tenant-homescreen', authMiddleware(ROLES.TENANT), getHomeScreenPropertiesForTenant);

        router.post('/filter-properties', authMiddleware(ROLES.TENANT), filterProperties);

        // Get all properties by user ID
        router.get('/get-properties', authMiddleware(ROLES.OWNER), getAllPropertiesByUserId);

        // Update property
        router.post('/update-property', authMiddleware(ROLES.OWNER), handleMultipartData.fields([{ name: 'media', maxCount: 100 }]), updateProperty);

        // Delete property
        router.delete('/delete-property/:propertyId', authMiddleware(ROLES.OWNER), deleteProperty);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/property';
    }
}

module.exports = PROPERTY_API;
