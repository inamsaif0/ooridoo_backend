const {
  createReview,
  getReview,
  findReview,
  insertManyReview,
  removeReview
} = require("../models/review");
const { generateResponse, parseBody } = require("../utils");

const { findUser } = require("../models/user");
const { findPropertybyId, updateProperty } = require("../models/property");
const {STATUS_CODE} = require('../utils/constants')

exports.addReview = async (req, res, next) => {
  try {
    const { detail, rating, propertyId, receiverId } = parseBody(req.body);
    const userExists = await findUser({ _id: req.user.id });

    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }

    // we are checking all the details regarding property existance 
    let Property = await findPropertybyId(propertyId)
    console.log(Property)
    if(propertyId.user_id === req.user.id){
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Owner Cannot Rate His/Her Own Property",
      });
    }
    let Review;
    if(propertyId)
      {
    Review = await createReview({
      userId: req.user.id,
      detail: detail,
      rating: rating,
      propertyId: propertyId,
      type: req.user.role,
      receiverId: Property.user_id,
    });

  }
  else{
    
    Review = await createReview({
      userId: req.user.id,
      detail: detail,
      rating: rating,
      receiverId: receiverId,
      // propertyId: propertyId,
      type: req.user.role
    });

  }
  generateResponse(Review, "You Have Succesfully Added A Review", res);

  } catch (error) {
    next(new Error(error.message));
  }
};

exports.ReplyReview = async (req, res, next) => {
  try {
    const { parentId, propertyId, detail } = parseBody(req.body);
    const userExists = await findUser({ _id: req.user.id });
    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }

    let findProperty = await findPropertybyId(propertyId);
    if (!findProperty) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "The property is not found",
      });
    }

    let review = await findReview({ _id: parentId });
    if (!review) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "The review is not found",
      });
    }
    let Review = await createReview({
      parentId: parentId,
      userId: req.user.id,
      detail: detail,
      propertyId: propertyId,
      type:req.user.role
    });
    generateResponse(Review, "You successfully replied to review", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = parseBody(req.body);
    const userExists = await findUser({ _id: req.user.id });
    if (!userExists) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User does not exist",
      });
    }

    let review = await findReview({ _id: reviewId });
    if (!review) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "The review is not found",
      });
    }
    let deleteReview = await removeReview(reviewId)
    generateResponse(deleteReview, "You successfully deleted review", res);

  } catch (error) {
    next(new Error(error.message))
  }
};

exports.editReview = async (req, res, next) => {
    try {
        const { reviewId, detail, rating } = parseBody(req.body);
        const userExists = await findUser({ _id: req.user.id });
        if (!userExists) {
          return next({
            statusCode: STATUS_CODE.BAD_REQUEST,
            message: "User does not exist",
          });
        }
    
        let review = await findReview({ _id: reviewId });
        if (!review) {
          return next({
            statusCode: STATUS_CODE.BAD_REQUEST,
            message: "The review is not found",
          });
        }
        let editedReview = await updateReview(reviewId,{
            detail: detail,
            rating: rating
        })
        let newReview =  await findReview({_id: reviewId})
        generateResponse(newReview, "You successfully updated review", res);
    
      } catch (error) {
        next(new Error(error.message))
      }  
};

