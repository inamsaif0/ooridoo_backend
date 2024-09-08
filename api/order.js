'use strict';

const router = require('express').Router();
const { upload } = require('../utils');
const {  getFavourite, removeFromFavorite, addToFavourite } = require('../controller/favourite.js');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const {handleMultipartData} = require('../utils/multipart')
const {createOrder} = require("../controller/order.js")
class ORDER_API {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        
        router.post('/checkout', authMiddleware(ROLES.USER), createOrder);
        router.get('/get-all-orders', authMiddleware([ROLES]),  )
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/order';
    }
}

module.exports = ORDER_API;
