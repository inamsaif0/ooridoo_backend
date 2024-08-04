'use strict';

const router = require('express').Router();
const { createPackage, updatePackage, deletePackage, getAllPackages} = require('../controller/package');
const { upload } = require('../utils');

class PackageAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        // router.use(upload().any());

        router.post('/create', createPackage);
        router.post('/update/:id', updatePackage);
        router.post('/delete/:id', deletePackage);
        router.get("/get", getAllPackages)

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/packages';
    }
}

module.exports = PackageAPI;
