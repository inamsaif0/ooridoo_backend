'use strict';

const router = require('express').Router();
const { upload } = require('../utils');
const {  getFavorites, removeFromFavorite, addToFavourite } = require('../controller/favourite.js');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const {handleMultipartData} = require('../utils/multipart')

class FOVOURITE_API {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        
        // Add property
        router.post('/add-to-favourite', authMiddleware(ROLES.TENANT), addToFavourite);

        router.post('/remove-from-favourite', authMiddleware(ROLES.TENANT), removeFromFavorite);

        router.get('/get-favourite', authMiddleware(ROLES.TENANT), getFavorites);

        // Get all properties by user ID

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/favourite';
    }
}

module.exports = FOVOURITE_API;
