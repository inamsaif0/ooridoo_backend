"use strict";
const {
  createProperty,
  getProperty,
  updateProperty,
  findPropertybyId,
  searchProperty,
  deleteProperty,
  PropertyModel,
  getPropertys,
} = require("../models/property");
const { generateResponse, parseBody, generateRandomOTP } = require("../utils");
const {
  findUser,
  createUser,
  updateUserById,
  getUsersExceptBlocked,
  generateToken,
  searchUsersExceptCurrentAndAdmin,
  getUserProfile,
  getMaxWinningUsers,
  getCurrentUserRank,
  updateUserCustomerId,
  getAccountIdByUserId,
  getCustomerIdByUserId,
  updateUserStatus,
  findUserForMe,
} = require("../models/user");

const {
  getReview
} = require("../models/review")
const {
  addPropertyValidation,
  updatePropertyValidation,
} = require("../validations/userValidation");
const { STATUS_CODE, NOTIFICATION_TYPE } = require("../utils/constants");
const { createMedia, deleteMediaByIds } = require("../models/media");
const { findFavoriteById, getFavorite } = require("../models/favourite");
const { property } = require("lodash");

exports.createProperty = async (req, res, next) => {
  try {
    // Destructure request body
    const {
      title,
      city,
      price,
      description,
      Bedrooms,
      Bathrooms,
      size,
      parking,
      farnished,
      longitude,
      latitude,
      property_type,
    } = parseBody(req.body);
    // Validate request body
    const { error } = addPropertyValidation.validate(req.body);
    if (error) {
      return next({
        statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
        message: error.details[0].message,
      });
    }

    // Check if the user exists
    const userExists = await findUser({ _id: req.user.id });
    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }

    // Create property object
    const propertyObj = {
      title,
      price,
      description,
      Bedrooms,
      Bathrooms,
      size,
      parking,
      farnished,
      coordinates: {},
      city,
      user_id: req.user.id,
      property_type,
      media: [],
    };

    if (longitude && latitude) {
      // Convert longitude and latitude to numbers
      let long = parseFloat(longitude);
      let lat = parseFloat(latitude);
      // Set location field as a geospatial point
      propertyObj.coordinates = {
        type: "Point",
        coordinates: [long, lat],
      };
      // If location is provided as a string, set it directly
    }

    // If files are present, process them
    if (req.files && req.files.media) {
      const profileImageFiles = req.files.media;

      // Iterate through profile image files and create MediaModel objects
      for (const file of profileImageFiles) {
        const profileImage = await createMedia({
          file: file.path,
          fileType: "Image", // Assuming award images are always images
          userId: req.user.id,
        });
        propertyObj.media.push(profileImage);
      }
    }

    // Create the property
    const property = await createProperty(propertyObj);

    // Respond with success message
    generateResponse(property, "Property created successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.fetchProperties = async (req, res, next) => {
  const { q } = req.body;
  const userId = req.user.id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  console.log("this is text overall", q);
  try {
    const users = await searchProperty({ page, limit, userId, q });
    generateResponse(users, "Property listed successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getAllPropertiesByUserId = async (req, res, next) => {
  try {
    const properties = await getProperty({ user_id: req.user.id }); // Implement findPropertiesByUserId
    generateResponse(properties, "Property listed successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.updateProperty = async (req, res, next) => {
  try {
    // Destructure request body
    const {
      propertyId,
      deleteImages,
      title,
      city,
      price,
      description,
      Bedrooms,
      Bathrooms,
      size,
      parking,
      farnished,
      longitude,
      latitude,
      property_type,
    } = parseBody(req.body);

    // Validate request body
    const { error } = updatePropertyValidation.validate(req.body);
    if (error) {
      return next({
        statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
        message: error.details[0].message,
      });
    }

    // Check if the property exists
    const propertyExists = await findPropertybyId(propertyId);
    if (!propertyExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Property does not exist",
      });
    }
    // console.log('this is id match',propertyExists.user_id)
    // if (propertyExists.user_id !== req.user.id) {
    //     return next({
    //         statusCode: STATUS_CODE.UNAUTHORIZED,
    //         message: 'Unauthorized: You are not allowed to update this property'
    //     });
    // }
    // Update property object
    const updatedPropertyObj = {
      ...(title && { title }),
      ...(price && { price }),
      ...(description && { description }),
      ...(Bedrooms && { Bedrooms }),
      ...(Bathrooms && { Bathrooms }),
      ...(size && { size }),
      ...(parking && { parking }),
      ...(farnished && { farnished }),
      ...(longitude &&
        latitude && {
          coordinates: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
        }),
      ...(city && { city }),
      ...(property_type && { property_type }),
      media: propertyExists.media, // Preserve existing media unless deleted
    };

    console.log(propertyExists[0]);
    // If deleteImages array is provided, remove corresponding image IDs from media array
    if (
      deleteImages &&
      Array.isArray(deleteImages) &&
      deleteImages.length > 0
    ) {
      await deleteMediaByIds(deleteImages);
      updatedPropertyObj.media = propertyExists[0].media.filter(
        (media) => !deleteImages.includes(media._id.toString())
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
          updatedPropertyObj.media.push(newMedia);
        }
      }
    }

    if (longitude && latitude) {
      // Convert longitude and latitude to numbers
      let long = parseFloat(longitude);
      let lat = parseFloat(latitude);
      // Set location field as a geospatial point
      updatedPropertyObj.coordinates = {
        type: "Point",
        coordinates: [long, lat],
      };
    }

    // Update the property
    const updatedProperty = await updateProperty(
      propertyId,
      updatedPropertyObj
    ).populate("media");

    // Respond with success message
    generateResponse(updatedProperty, "Property updated successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.deleteProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    // Delete property
    const propertyExists = await findPropertybyId(propertyId);
    if (!propertyExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Property does not exist",
      });
    }
    await deleteProperty(propertyId); // Implement deleteProperty
    generateResponse({}, "Property deleted successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getHomeScreenPropertiesForTenant = async (req, res, next) => {
  try {
    // Extracting parameters from request
    const { currentPage = 1, itemsPerPage = 10, long, lat } = req.query;
    const status = req.body.status;

    let coordinates = [long, lat];
    let RatedPropertiesfirst = []
    // Calculating pagination parameters
    const skipCount = (currentPage - 1) * itemsPerPage;

    // Retrieving latest artists and artist list
    const propertyListFirst = await getProperty({})
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(itemsPerPage)
      .lean();
    for (const proper of propertyListFirst) {
      let data = await getFavorite({ propertyId: proper._id });
      console.log("this is proper>>>>>>>>>>>>>>>>>>>>>>>>>>>>", data);
      if (data.length > 0) {
        proper.isLiked = true;
      } else {
        proper.isLiked = false;
      }
    }
// handle review avg
    












    let propertyListSecond = await getPropertys(coordinates)
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(itemsPerPage)
      .lean();
      for (const proper of propertyListSecond) {
        let reviews = await getReview({ propertyId: proper._id, rating: { $gte: 3 } });
        if(reviews) {

        }
        let data = await getFavorite({ propertyId: proper._id });
        console.log("this is proper>>>>>>>>>>>>>>>>>>>>>>>>>>>>", data);
        if (data.length > 0) {
          proper.isLiked = true;
        } else {
          proper.isLiked = false;
        }
      }
    let responseData;
    switch (status) {
      case "topRated":
        // Initialize the response data
        responseData = {
          propertyListFirst: [],
          propertyListSecond: [],
        };
    
        // Process propertyListSecond
        for (const proper of propertyListSecond) {
          let reviews = await getReview({ propertyId: proper._id, rating: { $gte: 3 } });
          if (reviews && reviews.length > 0) {
            // Do something with the reviews
            // let total = reviews.reduce((sum, review) => sum + review.rating, 0);
            // total =  total / reviews.length;
           responseData.propertyListSecond.push(proper);
          }
        }
    
        // Process propertyListFirst
        for (const proper of propertyListFirst) {
          let reviews = await getReview({ propertyId: proper._id, rating: { $gte: 4 } });
          if (reviews && reviews.length > 0) {
            // Do something with the reviews
            responseData.propertyListFirst.push(proper);
          }
        }
        // Response data now contains the lists with processed properties and reviews
        break;
      case "newest":
        responseData = { propertyListFirst, propertyListSecond };
        break;
      case "nearMe":
        responseData = { propertyListFirst, propertyListSecond };
        break;
      default:
        throw new Error("Invalid status provided");
    }

    // Sending response
    generateResponse(responseData, "Home Screen Retrieved Succesfully", res);
  } catch (error) {
    next(error);
  }
};

exports.filterProperties = async (req, res, next) => {
  try {
    // Extract filter parameters from the request body
    const {
      propertyType,
      size,
      budget,
      bedroomsCount,
      bathroomsCount,
      latitude,
      longitude,
      radius,
    } = req.body;
    console.log("Request body:", req.body);
    const range = budget * 0.05;
    const lowerLimit = budget - range;
    const upperLimit = budget + range;
    // Define the query object based on filter parameters
    const query = {
      ...(propertyType && { property_type: propertyType }),
      ...(size && { size: size }),
      ...(budget && { price: { $gte: lowerLimit, $lte: upperLimit } }),
      ...(bedroomsCount && { Bedrooms: bedroomsCount }),
      ...(bathroomsCount && { Bathrooms: bathroomsCount }),
      ...(longitude &&
        latitude && {
          coordinates: {
            $geoWithin: {
              $centerSphere: [[longitude, latitude], 1 / 6378.1], // Radius in kilometers
            },
          },
        }),
    };

    console.log("Generated query:", query);

    // Execute the query
    const properties = await PropertyModel.find(query)
      .populate({
        path: "user_id",
        populate: {
          path: "profileImage ssn_image",
        },
      })
      .populate("media")
      .exec();

    if (properties.length === 0) {
      generateResponse(
        properties,
        "No properties found. Try removing some filters.",
        res
      );
    } else {
      for (const proper of properties) {
        let data = await getFavorite({ propertyId: proper._id });
        console.log("this is proper>>>>>>>>>>>>>>>>>>>>>>>>>>>>", data);
        if (data.length > 0) {
          proper.IsLiked = true;
        } else {
          proper.IsLiked = false;
        }
      }
      generateResponse(properties, "Properties fetched successfully", res);
    }
  } catch (error) {
    next(error); // Pass error to the error handling middleware
  }
};
