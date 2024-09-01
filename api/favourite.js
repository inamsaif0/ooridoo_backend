'use strict';

const router = require('express').Router();
const { upload } = require('../utils');
const {  getFavourite, removeFromFavorite, addToFavourite } = require('../controller/favourite.js');
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
        
        router.post('/add-to-favourite', authMiddleware(ROLES.USER), addToFavourite);

        router.post('/remove-from-favourite', authMiddleware(ROLES.USER), removeFromFavorite);

        router.get('/get-favourite', authMiddleware(ROLES.USER), getFavourite);

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/favourite';
    }
}

module.exports = FOVOURITE_API;
