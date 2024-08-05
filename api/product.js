    'use strict';

const router = require('express').Router();
const { createProduct,searchProductsByAny, updateProduct, deleteProduct, getAllProducts } = require('../controller/product');
const { upload } = require('../utils');
const {handleMultipartData}=require("../utils/multipart")
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
class ProductAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        // router.use(upload().any());

        router.post('/create', authMiddleware([ROLES.ADMIN]),handleMultipartData.fields([
            {
              name: "media",
              maxCount: 10,
            }
          ]),createProduct);
        router.post('/update/:id', authMiddleware([ROLES.ADMIN]),updateProduct);
        router.post('/delete/:id', authMiddleware([ROLES.ADMIN]), deleteProduct);
        router.get("/get", authMiddleware([ROLES.ADMIN]), getAllProducts)
        router.post('/search-products', authMiddleware([ROLES.ADMIN]), searchProductsByAny);

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/products';
    }
}

module.exports = ProductAPI;
