    'use strict';

const router = require('express').Router();
const { createProduct,searchProductsByAny, updateProduct,getProductImage, deleteProduct, getAllProducts } = require('../controller/product');
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
        router.post('/update', authMiddleware([ROLES.ADMIN]),handleMultipartData.fields([
            {
              name: "media",
              maxCount: 10,
            }
          ]),updateProduct);
        router.post('/delete', authMiddleware([ROLES.ADMIN]), deleteProduct);
        router.get("/get", getAllProducts)
        router.post('/search-products', searchProductsByAny);
        router.post('/get-product-images', authMiddleware([ROLES.ADMIN]), getProductImage);


    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/products';
    }
}

module.exports = ProductAPI;
