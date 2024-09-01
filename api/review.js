'use strict';

const router = require('express').Router();
const { addReview, ReplyReview, getAllProductReviewsById,deleteReview, editReview } = require('../controller/review');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');

class REVIEW_API {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        
        // Add property 
        router.post('/add-review', authMiddleware(Object.values(ROLES)), addReview);

        router.post('/reply-review', authMiddleware(Object.values(ROLES)), ReplyReview);

        router.post('/delete-review', authMiddleware(Object.values(ROLES)), deleteReview);
        
        router.post('/edit-review', authMiddleware(Object.values(ROLES)), editReview);
        // Get all properties by user ID
        // router.get('/get-my-requests', authMiddleware(ROLES.TENANT), getMyRequests);
        router.get("/get-all-product-reviews/:productId", authMiddleware(Object.values(ROLES)), getAllProductReviewsById)
        // Update property

        // Delete property
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/review';
    }
}

module.exports = REVIEW_API;
