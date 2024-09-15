const { generateResponse, parseBody } = require('../utils');
const { addCategory,searchCatrgories, getCategoryById, getCategory, getCategories, updateCategoryById, deleteCategoryById } = require("../models/subCategory");
const { categoryValidation } = require("../validations/userValidation");
const { createMedia, deleteMediaByIds } = require("../models/media");
const {STATUS_CODE} = require("../utils/constants")
exports.createCategory = async (req, res, next) => {
  let {
    title,
    media,
    category
  } = parseBody(req.body);

  try {
    let { error } = categoryValidation.validate(req.body);
    if (error) {
      return next({
        statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
        message: error.details[0].message,
      });
    }

    if (req.files && req.files.media) {
      const mediaFile = req.files.media[0];
      const newMedia = await createMedia({
        file: mediaFile.path,
        fileType: "Image",
        userId: req.user.id,
      });
      media = newMedia._id;
    }

    let newCategory = await addCategory({ title, media, category });
    if (!newCategory) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Cannot create category, something went wrong!",
      });
    }
    generateResponse(newCategory, "Category created successfully", res);

  } catch (error) {
    next(new Error(error.message));
  }
}

exports.updateCategory = async (req, res, next) => {
  try {
    const {
      subcategoryId,
      deleteImages,
      title,
      category
    } = parseBody(req.body);

    // const { error } = categoryValidation.validate(req.body);
    // if (error) {
    //   return next({
    //     statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
    //     message: error.details[0].message,
    //   });
    // }

    const categoryExists = await getCategory({ _id: categoryId });
    if (!categoryExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Category does not exist",
      });
    }

    const updateCategoryObject = {
      ...(title && { title }),
      ...(category && {category}),
      media: categoryExists.media,
    };

    if (deleteImages && Array.isArray(deleteImages) && deleteImages.length > 0) {
      await deleteMediaByIds(deleteImages);
      updateCategoryObject.media = null;
    }

    if (req.files && req.files.media && req.files.media.length > 0) {
      const mediaFile = req.files.media[0];
      const newMedia = await createMedia({
        file: mediaFile.path,
        fileType: "Image",
        userId: req.user.id,
      });
      updateCategoryObject.media = newMedia._id;
    }

    const updatedCategory = await updateCategoryById(subcategoryId, updateCategoryObject);

    generateResponse(updatedCategory, "Category updated successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    let { id } = req.body;
    let categoryExists = await getCategoryById(id);
    if (!categoryExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Category does not exist",
      });
    }
    await deleteCategoryById(id);
    generateResponse({}, "Category deleted successfully", res);

  } catch (error) {
    next(new Error(error.message));
  }
}
exports.getAllCategories = async (req, res, next) => {
    // try{
    //     let data = await getCategories({})
    //     generateResponse(data, "Products get successfully", res);

    // }
    // catch(error){
    //     next(new Error(error.message));

    // }

    // const { q } = req.body;
    // const userId = req.user.id;
  let q = "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log("this is text overall", q);
    try {
      const users = await searchCatrgories({ page, limit, q });
      generateResponse(users, "Cateogies Fetched successfully", res);
    } catch (error) {
      next(new Error(error.message));
    }
}

exports.searchCategoryByAny = async (req, res, next) => {
  const { q } = req.body;
  // const userId = req.user.id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  console.log("this is text overall", q);
  try {
    const users = await searchCatrgories({ page, limit, q });
    generateResponse(users, "Cateogies Searched successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};