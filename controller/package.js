const { generateResponse, parseBody } = require('../utils');
const { addPackage,searchPackages, getPackage, getPackages,getPackagesCount, updatePackageById, deletePackageById } = require("../models/packages");
const { packageValidation } = require("../validations/userValidation");
const { createMedia, deleteMediaByIds } = require("../models/media");
const { STATUS_CODE } = require("../utils/constants")

exports.createPackage = async (req, res, next) => {
  let {
    title,
    description,
    products,
  } = parseBody(req.body);

  try {
    // let { error } = packageValidation.validate(req.body);
    // if (error) {
    //   return next({
    //     statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
    //     message: error.details[0].message,
    //   });
    // }

    let obj = {
      title,
      description,
      products,
      media: []
    }
    if (req.files && req.files.media) {
      const mediaFiles = req.files.media;

      for (const file of mediaFiles) {
        const newMedia = await createMedia({
          file: file.path,
          fileType: "Image",
          userId: req.user.id,
        });
        obj.media.push(newMedia._id);
      }
    }

    let newPackage = await addPackage(obj);
    if (!newPackage) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Cannot create package, something went wrong!",
      });
    }
    generateResponse(newPackage, "Package created successfully", res);

  } catch (error) {
    next(new Error(error.message));
  }
}

exports.updatePackage = async (req, res, next) => {
  try {
    const {
      packageId,
      deleteImages,
      title,
      description,
      products,
      deletedProducts
    } = parseBody(req.body);

    // const { error } = packageValidation.validate(req.body);
    // if (error) {
    //   return next({
    //     statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
    //     message: error.details[0].message,
    //   });
    // }

    const packageExists = await getPackage({ _id: packageId });
    if (!packageExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Package does not exist",
      });
    }

    const updatePackageObject = {
      ...(title && { title }),
      ...(description && { description }),
      ...(products && { products }),
      media: packageExists.media,
    };

    if (deleteImages && Array.isArray(deleteImages) && deleteImages.length > 0) {
      await deleteMediaByIds(deleteImages);
      updatePackageObject.media = null
    }

    if (req.files && Object.keys(req.files).length > 0) {
      if (req.files.media.length > 0) {
        const newFiles = req.files.media;

        for (const file of newFiles) {
          const newMedia = await createMedia({
            file: file.path,
            fileType: "Image",
            // userId: req.user.id,
          });
          updatePackageObject.media = newMedia._id;
        }
      }
    }
    if (deletedProducts.length > 0) {
      const updatedPackage = await updatePackageById(packageId, {
        $pull: { products: { $in: deletedProducts } }
      });
    }
    
    const updatedPackage = await updatePackageById(packageId, updatePackageObject);

    generateResponse(updatedPackage, "Package updated successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.deletePackage = async (req, res, next) => {
  try {
    let { id } = req.body;
    let packageExists = await getPackage({ _id: id });
    if (!packageExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Package does not exist",
      });
    }
    await deletePackageById(id);
    generateResponse({}, "Package deleted successfully", res);

  } catch (error) {
    next(new Error(error.message));
  }
}

exports.getAllPackages = async (req, res, next) => {
  // try {
  //     // Get page and limit from query parameters, set default values if not provided
  //     const page = parseInt(req.query.page) || 1;
  //     const limit = parseInt(req.query.limit) || 10;

  //     // Calculate the offset
  //     const offset = (page - 1) * limit;

  //     // Fetch the total count of items
  //     const totalItems = await getPackagesCount({});

  //     // Fetch the paginated data
  //     let data = await getPackages({
  //         limit,
  //         offset
  //     }).populate("media").populate({path:"products", populate:{
  //       path: "media"
  //     }});

  //     // Calculate total pages
  //     const totalPages = Math.ceil(totalItems / limit);

  //     // Create the paginated response
  //     const paginatedResponse = {
  //         data,
  //         meta: {
  //             totalItems,
  //             totalPages,
  //             currentPage: page,
  //             pageSize: limit
  //         }
  //     };

  //     // Generate response
  //     generateResponse(paginatedResponse, "Packages retrieved successfully", res);
  // } catch (error) {
  //     next(new Error(error.message));
  // }

  // const { q } = req.body;
  // const userId = req.user.id;
  let q = '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  console.log("this is text overall", q);
  try {
    const users = await searchPackages({ page, limit, q });
    generateResponse(users, "Packages Fetched successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.searchPackageByAny = async (req, res, next) => {
  const { q } = req.body;
  // const userId = req.user.id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  console.log("this is text overall", q);
  try {
    const users = await searchPackages({ page, limit, q });
    generateResponse(users, "Packages Searched successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};