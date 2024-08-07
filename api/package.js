'use strict';

const router = require('express').Router();
const { createPackage,searchPackageByAny, updatePackage, deletePackage, getAllPackages} = require('../controller/package');
const { upload } = require('../utils');
const {handleMultipartData} = require("../utils/multipart")
const authMiddleware = require("../middlewares/Auth")
const{ROLES} = require("../utils/constants")
class PackageAPI {
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
          ]), createPackage);
        router.post('/update/:id', updatePackage);
        router.post('/delete', deletePackage);
        router.get("/get", getAllPackages)
        router.post('/search-packages', searchPackageByAny);

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/packages';
    }
}

module.exports = PackageAPI;
