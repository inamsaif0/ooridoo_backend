'use strict';

const router = require('express').Router();
const { upload } = require('../utils');
const {  getFavourite, removeFromFavorite, addToFavourite } = require('../controller/favourite.js');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const {handleMultipartData} = require('../utils/multipart')
const {createOrder, getAllOrders, updateOrder, changeOrderDeliveryStatus} = require("../controller/order.js")
class ORDER_API {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        
        router.post('/checkout', authMiddleware(ROLES.USER), createOrder);
        router.post('/change-order-delivery-status', authMiddleware(ROLES.USER), changeOrderDeliveryStatus);
        router.get('/get-all-orders', authMiddleware([ROLES]),  getAllOrders),
        router.get("/complete-order", authMiddleware(ROLES.USER), updateOrder)
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/order';
    }
}

module.exports = ORDER_API;
