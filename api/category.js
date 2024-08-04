'use strict';

const router = require('express').Router();
const { createCategory, updateCategory, deleteCategory } = require('../controller/category');
const { upload } = require('../utils');

class CategoryAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        // router.use(upload().any());

        router.post('/create', createCategory);
        router.post('/update/:id', updateCategory);
        router.post('/delete/:id', deleteCategory);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/categories';
    }
}

module.exports = CategoryAPI;
