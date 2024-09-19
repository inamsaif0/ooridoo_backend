const { generateResponse, parseBody, generateRandomOTP } = require('../utils');
const { addProduct, searchProducts, getProduct, getProductImages,getProducts,getProductById, deleteProduct, updateProductById} = require("../models/products");
const { productValidation } = require("../validations/userValidation");
const { createMedia, deleteMediaByIds } = require("../models/media")
const { STATUS_CODE} = require('../utils/constants');

exports.createProduct = async (req, res, next) => {
    let {
        title,
        description,
        productType,
        sku,
        brandName,
        category,
        price,
        subCategory,
        language
    } = parseBody(req.body);

    let obj = {
        title,
        description,
        productType,
        sku,
        brandName,
        category,
        subCategory,
        price,
        language,
        media: []  // Initialize media as an empty array
    };

    try {
        // Validate the product data
        let { error } = productValidation.validate(req.body);
        if (error) {
            return next({
                statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
                message: error.details[0].message,
            });
        }

        // Handle file uploads
        if (req.files && req.files.media) {
            const mediaFiles = req.files.media;
            for (const file of mediaFiles) {
                try {
                    const newMedia = await createMedia({
                        file: file.path,
                        fileType: "Image", // Assuming media files are images
                        userId: req.user.id,
                    });
                    obj.media.push(newMedia._id); // Add the media ID to the media array
                } catch (mediaError) {
                    return next({
                        statusCode: STATUS_CODE.INTERNAL_SERVER_ERROR,
                        message: `Failed to upload media: ${mediaError.message}`,
                    });
                }
            }
        }

        // Create the product
        const product = await addProduct(obj);
        if (!product) {
            return next({
                statusCode: STATUS_CODE.BAD_REQUEST,
                message: "Cannot create product, something went wrong!",
            });
        }

        // Send response
        generateResponse(product, "Product created successfully", res);
    } catch (error) {
        next(new Error(error.message));
    }
};
exports.updateProduct = async (req, res, next) => {
    try {
      // Destructure request body
      const {
        productId,
        deleteImages,
        title,
        description,
        productType,
        sku,
        brandName,
        category,
        subCategory,
        price,
        language,
      } = parseBody(req.body);
  
      console.log('this is body?????????????????????',req.body)
      // Check if the property exists
      const productExists = await getProduct({_id:productId});
      if (!productExists) {
        return next({
          statusCode: STATUS_CODE.BAD_REQUEST,
          message: "product does not exist",
        });
      }

      // Update property object
      const updateProductObject = {
        ...(title && { title }),
        ...(price && { price }),
        ...(description && { description }),
        ...(productType && { productType }),
        ...(sku && { sku }),
        ...(brandName && { brandName }),
        ...(category && { category }),
        ...(language && { language }),
        ...(subCategory && { subCategory }),
        media: productExists.media, // Preserve existing media unless deleted
      };
  
      // If deleteImages array is provided, remove corresponding image IDs from media array
      if (
        deleteImages &&
        Array.isArray(deleteImages) &&
        deleteImages.length > 0
      ) {
        await deleteMediaByIds(deleteImages);
        updateProductObject.media = productExists?.media?.filter(
          (media) => !deleteImages.includes(media?._id.toString())
        );
      }
      // If new files are uploaded (req.files), process them and add them to the media array
      if (req.files && Object.keys(req.files).length > 0) {
        if (req.files.media.length > 0) {
          const newFiles = req.files.media;
  
          // Iterate through new files and create MediaModel objects
          for (const file of newFiles) {
            const newMedia = await createMedia({
              file: file.path,
              fileType: "Image", // Assuming all new files are images
              userId: req.user.id,
            });
            updateProductObject.media.push(newMedia);
          }
        }
      }
 
  
      // Update the property
      const updatedProduct = await updateProductById(
        productId,
        updateProductObject
      ).populate("media");
  
      // Respond with success message
      generateResponse(updatedProduct, "Product updated successfully", res);
    } catch (error) {
      next(new Error(error.message));
    }
};
exports.deleteProduct = async (req, res, next) => {
    try{
        let {id} = req.body;
        if(!id){
          return next({
            statusCode: STATUS_CODE.BAD_REQUEST,
            message: "id should not be empty",
          });
        }
        let productExist = await getProductById(id);
        console.log('this is the product>>>',productExist)
        if(!productExist){
            return next({
                statusCode: STATUS_CODE.BAD_REQUEST,
                message: "product does not exist",
              });
        }
        let product = await deleteProduct(id);
        generateResponse({}, "product deleted successfully", res)

    }   
    catch(error){
        next(new Error(error.message))
    }
}
exports.getProductImage = async (req, res, next)=> {
  try{
    let { productId} = req.body;

    let productImages = await getProductImages(productId);
    generateResponse(productImages, "Images Fetched successfully", res);

  }
  catch(error){
    next(new Error(error.message))
  }
}
exports.getAllProducts = async (req, res, next) => {
    
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      let q = '';
      let category = req.query.category;
      let userId = req?.user?.id;
      let subcategory = req.query.subcategory;
      let language = req.query.language;
      
      let device_token =  req.query.device_token;
      console.log("this is text overall", userId);
      try {
        const users = await searchProducts({ page, limit, q, category,language, subcategory, userId, device_token });
        generateResponse(users, "Products Fetched successfully", res);
    }
    catch(error){
        next(new Error(error.message));
    }
}
exports.searchProductsByAny = async (req, res, next) => {
  const { q } = req.body;
  // const userId = req.user.id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let userId = req?.user?.id;
  let device_token =  req.query.device_token;

  console.log("this is text overall", q);
  try {
    const users = await searchProducts({ page, limit, q, userId, device_token });
    generateResponse(users, "Products Searched successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};
  
