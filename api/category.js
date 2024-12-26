'use strict';

const router = require('express').Router();
const { createCategory, searchCategoryByAny, updateCategory, getAllCategories, deleteCategory , getNestedCategory} = require('../controller/category');
const { upload } = require('../utils');
const { handleMultipartData } = require("../utils/multipart")
const authMiddleware = require("../middlewares/Auth")
const { ROLES } = require("../utils/constants")

class CategoryAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        // router.use(upload().any());

        router.post('/create', authMiddleware([ROLES.ADMIN]), handleMultipartData.fields([
            {
                name: "media",
                maxCount: 10,
            }
        ]), createCategory);
        router.post('/update', authMiddleware([ROLES.ADMIN]), handleMultipartData.fields([
            {
                name: "media",
                maxCount: 10,
            }
        ]), updateCategory);
        router.post('/delete', authMiddleware([ROLES.ADMIN]), deleteCategory);
        router.get('/get', getAllCategories)
        router.post('/search-categories', searchCategoryByAny);
        router.get("/getAllCategories",getNestedCategory )
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/categories';
    }
}

module.exports = CategoryAPI;
