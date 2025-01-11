const { generateResponse, parseBody } = require('../utils');
const { addSubCategory,searchSubCatrgories, getSubCategoryById, getSubCategory, getSubCategories, updateSubCategoryById, deleteSubCategoryById } = require("../models/subCategory");
const { categoryValidation } = require("../validations/userValidation");

const { addCategory, getCategoryById, getCategory, getCategories, updateCategoryById, deleteCategoryById } = require("../models/categories");

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

    let newCategory = await addSubCategory({ title, media, category });
    if (!newCategory) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Cannot create category, something went wrong!",
      });
    }

    await updateCategoryById(category, {
      $push: { subcategoryId: newCategory._id }
    });

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

    const categoryExists = await getSubCategory({ _id: subcategoryId });
    if (!categoryExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Sub Category does not exist",
      });
    }

    const updateCategoryObject = {
      ...(title && { title }),
      ...(category && { category }),
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

    const updatedCategory = await updateSubCategoryById(subcategoryId, updateCategoryObject);

    if(category){
    await updateCategoryById(category, {
      $push: { subcategoryId: subcategoryId }
    });
  }
    let sub = await getSubCategoryById(subcategoryId)
    generateResponse(sub, "Category updated successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    let { id } = req.body;
    let categoryExists = await deleteSubCategoryById(id);
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
    const limit = parseInt(req.query.limit) || 1000;
    console.log("this is text overall", q);
    try {
      let lookup = {
          $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category"
          }
      }
      const users = await searchSubCatrgories({ page, limit, q, lookup });
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
    const users = await searchSubCatrgories({ page, limit, q });
    generateResponse(users, "Cateogies Searched successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};