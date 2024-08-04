const { generateResponse, parseBody } = require('../utils');
const { addPackage, getPackage, getPackages, updatePackageById, deletePackageById } = require("../models/packages");
const { packageValidation } = require("../validations/userValidation");
const { createMedia, deleteMediaByIds } = require("../models/media");

exports.createPackage = async (req, res, next) => {
  let {
    title,
    description,
    products,
    media
  } = parseBody(req.body);

  try {
    let { error } = packageValidation.validate(req.body);
    if (error) {
      return next({
        statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
        message: error.details[0].message,
      });
    }

    if (req.files && req.files.media) {
      const mediaFiles = req.files.media;

      for (const file of mediaFiles) {
        const newMedia = await createMedia({
          file: file.path,
          fileType: "Image",
          userId: req.user.id,
        });
        media.push(newMedia);
      }
    }

    let newPackage = await addPackage({ title, description, products, media });
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
    } = parseBody(req.body);

    const { error } = packageValidation.validate(req.body);
    if (error) {
      return next({
        statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
        message: error.details[0].message,
      });
    }

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
      updatePackageObject.media = packageExists.media.filter(
        (media) => !deleteImages.includes(media._id.toString())
      );
    }

    if (req.files && Object.keys(req.files).length > 0) {
      if (req.files.media.length > 0) {
        const newFiles = req.files.media;

        for (const file of newFiles) {
          const newMedia = await createMedia({
            file: file.path,
            fileType: "Image",
            userId: req.user.id,
          });
          updatePackageObject.media.push(newMedia);
        }
      }
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
    try{
        let data = await getPackages({})
    generateResponse(data, "Package deleted successfully", res);

    }
    catch(error){
        next(new Error(error.message));

    }
}
