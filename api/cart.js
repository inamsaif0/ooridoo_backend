'use strict';

const router = require('express').Router();
const { upload } = require('../utils');
const {  getCart, updateCartCount, addToCart, deleteFromCart } = require('../controller/cart');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const {handleMultipartData} = require('../utils/multipart')

class CART_API {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        
        router.post('/add-to-cart', authMiddleware(ROLES.USER), addToCart);

        router.post('/remove-from-cart', authMiddleware(ROLES.USER), deleteFromCart);

        router.post('/update-cart-count', authMiddleware(ROLES.USER), updateCartCount)

        router.get('/get-cart', authMiddleware(ROLES.USER), getCart);

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/cart';
    }
}

module.exports = CART_API;
