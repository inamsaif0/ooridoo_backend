"use strict";
const { generateResponse, parseBody, generateRandomOTP } = require("../utils");
const {
  findUser,
  createUser,
  getAllUsers,
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
  getUserCount,
  findUserForMe,
} = require("../models/user");

const { MediaModel } = require("../models/media");
const { blockUser, findBlockUser, unblockUser } = require("../models/block");
const { addOTP, deleteOTPs } = require("../models/otp");
const { compare, hash } = require("bcrypt");
const { sendEmail } = require("../utils/mailer");
const jwt = require("jsonwebtoken");
const {
  STATUS_CODE,
  NOTIFICATION_TYPE,
  NOTIFICATION_RELATED_TYPE,
  ROLES,
  STATUS,
} = require("../utils/constants");
const {
  createAndSendNotification,
  deleteAllNotification,
} = require("../models/notification");
const { Types, disconnect } = require("mongoose");
const {
  addOrRemoveFollowingValidation,
  updateProfileValidation,
  registerUserValidation,
  loginUserValidation,
  resetPasswordValidation,
  IsNotificationValidator,
} = require("../validations/userValidation");
const { getReview, updateReview } = require("../models/review");
const {
  getProperty,
  getPropertyForOwner,
  updateProperty,
} = require("../models/property");
const { findRents } = require("../models/rent");
const { updateManyReviews } = require("../models/review");
const { updateChats } = require("../models/chat");
const { updateMessages } = require("../models/message");
const { addGuest, getGuest } = require("../models/guest")
exports.register = async (req, res, next) => {
  const body = parseBody(req.body);
  const { error } = registerUserValidation.validate(body);
  if (error)
    return next({
      status: false,
      statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
      message: error.details[0].message,
    });
  console.log("this is file>>>>>>>>", req.files);
  try {
    const userExists = await findUser({ email: body.email });
    if (userExists)
      return next({
        data: {
          status: false,
        },
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User already exists",
      });

    // hash password
    const hashedPassword = await hash(body.password, 10);
    body.password = hashedPassword;
    
    if (req.file) body.profileImage = `users/${req.file.filename}`;

    // Add image path to the user object
    const user = await createUser(body);
    // delete otps for this email
    // await deleteOTPs(body.email);

    // const otpObj = await addOTP({
    //   email: body.email,
    //   otp: generateRandomOTP(),
    // });

    if (!user)
      return next({
        data: {
          status: false,
        },
        statusCode: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Something went wrong",
      });

    // send email
    // await sendEmail(body.email, "OTP", `Your OTP is ${otpObj.otp}`);

    generateResponse(
      { user },
      "user registered successfully",
      res
    );
  } catch (error) {
    next(new Error(error.message));
  }
};
// login user
exports.login = async (req, res, next) => {
  const body = parseBody(req.body);

  const { error } = loginUserValidation.validate(body);
  if (error)
    return next({
      data: {
        status: false,
      },
      statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
      message: error.details[0].message,
    });

  const { email, password, device_token } = body;

  try {
    const user = await findUser({ email }).select("+password");
    if (!user)
      return next({
        status: false,
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User not found",
      });
    if (user.role == "owner") {
      const isMatch = await compare(password, user.password);
      if (!isMatch)
        return next({
          status: false,
          statusCode: STATUS_CODE.BAD_REQUEST,
          message: "Invalid credentials",
        });

      if (!user.is_verified) {
        const token = generateToken(user);

        return next({
          staus: false,
          statusCode: STATUS_CODE.BAD_REQUEST,
          message: "Please verify your account to login",
          data: { is_verified: false, token: token },
        });
      }
      if (!user.is_completed) {
        const token = generateToken(user);

        return next({
          statusCode: STATUS_CODE.BAD_REQUEST,
          staus: false,
          message: "Please complete your profile to login",
          data: { is_completed: false, role: user.role, token: token },
        });
      }

      // if (!user.isActive) return next({
      //     statusCode: STATUS_CODE.BAD_REQUEST,
      //     message: 'Your account is deactivated, please contact admin'
      // });

      // update fcm token
      console.log("this is user", user);
      let updatedUser = await updateUserById(user._id, {
        $set: { device_tokens: device_token },
      });
      let User = await findUser({ _id: user._id });
      const token = generateToken(user);
      let property = await getPropertyForOwner({ user_id: user._id });
      let reviews = await getReview({
        receiverId: user._id,
        parentId: null,
      }).populate({
        path: "userId",
        populate: {
          path: "profileImage ssn_image backgroundImage",
        },
      });
      console.log(property);
      // login successful with cookie-session
      // req.session.userId = user._id;        // req.session.email = email;
      generateResponse(
        { User, property, reviews, token },
        "Login successful",
        res
      );
    } else {
      const isMatch = await compare(password, user.password);
      if (!isMatch)
        return next({
          status: false,
          statusCode: STATUS_CODE.BAD_REQUEST,
          message: "Invalid credentials",
        });

      if (!user.is_verified) {
        const token = generateToken(user);

        return next({
          staus: false,
          statusCode: STATUS_CODE.BAD_REQUEST,
          message: "Please verify your account to login",
          data: { is_verified: false, token: token },
        });
      }
      if (!user.is_completed) {
        const token = generateToken(user);

        return next({
          statusCode: STATUS_CODE.BAD_REQUEST,
          staus: false,
          message: "Please complete your profile to login",
          data: { is_completed: false, role: user.role, token: token },
        });
      }

      // if (!user.isActive) return next({
      //     statusCode: STATUS_CODE.BAD_REQUEST,
      //     message: 'Your account is deactivated, please contact admin'
      // });

      // update fcm token
      let updatedUser = await updateUserById(user._id, {
        $set: { device_tokens: device_token },
      });
      let User = await findUser({ _id: user._id });
      const token = generateToken(user);
      // let analytics  = {
      //     purchases_count: 3,
      //     discount: "20%",
      //     purchases: "$50000"
      // }
      // login successful with cookie-session
      // req.session.userId = user._id;
      let currentLandLord = await findRents({
        tenantId: user._id,
        status: STATUS.STARTED,
      }); // req.session.email = email;
      generateResponse(
        { User, currentLandLord: currentLandLord?.receiverId, token },
        "Login successful",
        res
      );
    }
  } catch (error) {
    next(new Error(error.message));
  }
};
exports.addGuest = async (req, res, next) => {
  try {
    const { device_token } = req.body;

    if (!device_token) {
      return next({
        status: false,
        statusCode: STATUS_CODE.UNAUTHORIZED,
        message: "Device token is required",
      });
    }

    const existingGuest = await getGuest({ device_token });
    if (existingGuest) {
      return generateResponse({}, "You are already a guest", res);
    }

    const newGuest = await addGuest({ device_token });
    return generateResponse(newGuest, "Guest created successfully", res);
  } catch (error) {
    return next(new Error(error.message));
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const User = await findUser({ _id: req.user.id });
    console.log(User);
    if (!User)
      return next({
        data: {
          status: false,
        },
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User not exists",
      });

    let property = await getPropertyForOwner({ user_id: User._id });
    console.log(property);
    let reviews = await getReview({
      receiverId: User._id,
      parentId: null,
    }).populate({
      path: "userId",
      populate: {
        path: "profileImage ssn_image backgroundImage",
      },
    });
    // login successful with cookie-session
    // req.session.userId = user._id;        // req.session.email = email;
    generateResponse(
      { User, property, reviews },
      "Profile Retrieved successful",
      res
    );
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.verifyToken = async (req, res, next) => {
  try {
    const tokenHeader = req.headers["token"];
    if (!tokenHeader)
      return next({
        status: false,
        statusCode: STATUS_CODE.UNAUTHORIZED,
        message: "Token header not found",
      });

    jwt.verify(tokenHeader, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return next({
          status: false,
          statusCode: STATUS_CODE.UNAUTHORIZED,
          message: "Invalid token",
        });
      }
      const User = await findUser({ _id: decoded.id });
      if (!User) {
        return next({
          status: false,
          statusCode: STATUS_CODE.UNAUTHORIZED,
          message: "Invalid token",
        });
      }
      if (User.role == "owner") {
        let property = await getPropertyForOwner({ user_id: User._id });
        const token = generateToken(User);
        let reviews = await getReview({
          receiverId: User._id,
          parentId: null,
        }).populate({
          path: "userId",
          populate: {
            path: "profileImage ssn_image backgroundImage",
          },
        });
        generateResponse(
          { User, property, reviews, token },
          "Login successful",
          res
        );
      } else {
        let currentLandLord = await findRents({
          tenantId: User._id,
          status: STATUS.STARTED,
        }); // req.session.email = email;
        const token = generateToken(User);
        generateResponse(
          { User, currentLandLord: currentLandLord?.receiverId, token },
          "Login successful",
          res
        );
      }
    });
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.createAccount = async (req, res) => {
  const data = await getAccountIdByUserId(req.user.id);
  const accountLinks = await stripe.accountLinks.create({
    account: data.account_id,
    refresh_url: `${process.env.LOCALHOST}/api/stripe/account/reauth?account_id=${data.customer_id}`,
    return_url: `${process.env.LOCALHOST}/register${
      data.customer_id ? "-mobile" : ""
    }?account_id=${data.customer_id}&result=success`,
    type: "account_onboarding",
  });

  res.status(200).json({ success: true, url: accountLinks });
};

exports.connectAccountSuccessful = async (req, res) => {
  const { isVerified } = req.body;
  const userId = req.user.id;

  const data = await updateUserStatus(userId, isVerified);
  res.status(200).json({ success: true, data });
};

exports.loginToConnectAccount = async (req, res) => {
  const data = await getAccountIdByUserId(req.user.id);

  const loginLink = await stripe.accounts.createLoginLink(data.account_id);

  res.status(200).json({ success: true, url: loginLink });
};
// to create stripe account
exports.createAccountForStripe = async (req, res) => {
  const { method } = req;

  if (method === "GET") {
    // CREATE CONNECTED ACCOUNT
    //   const { mobile } = req.query
    const account = await stripe.accounts.create({
      type: "standard",
    });
    const accountLinks = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.LOCALHOST}/api/stripe/account/reauth?account_id=${account.id}`,
      return_url: `${process.env.LOCALHOST}/register${
        account.id ? "-mobile" : ""
      }?account_id=${account.id}&result=success`,
      type: "account_onboarding",
    });
    //   if (mobile) {
    //     // In case of request generated from the flutter app, return a json response
    res.status(200).json({ success: true, url: accountLinks.url });
    //   } else {
    // In case of request generated from the web app, redirect
    // res.redirect(accountLinks.url)
    //   }
  } else if (method === "DELETE") {
    // Delete the Connected Account having provided ID
    const {
      query: { id },
    } = req;
    console.log(id);
    const deleted = await stripe.accounts.del(id);
    res.status(200).json({ message: "account deleted successfully", deleted });
  } else if (method === "POST") {
    // Retrieve the Connected Account for the provided ID
    // I know it shouldn't be a POST call. Don't judge :D I had a lot on my plate
    const account = await stripe.accounts.retrieve(req.query.id);
    res.status(200).json({ account });
  }
};
// for re-auth of the the link this is the function
exports.stripeReAuth = async (req, res) => {
  const { account_id: accountId } = req.query;

  const accountLinks = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.LOCALHOST}/api/stripe/account/reauth?account_id=${accountId}`,
    return_url: `${process.env.LOCALHOST}/register?account_id=${accountId}`,
    type: "account_onboarding",
  });
  res.redirect(accountLinks.url);
};

exports.deleteCard = async (req, res) => {
  let { cardId } = req.body;

  let customerId = await getCustomerIdByUserId(req.user.id);

  const deleted = await stripe.customers.deleteSource(
    customerId.customer_id,
    cardId
  );
  res.status(200).json({ success: true, data: deleted });
};

// add card to stripe
exports.addCardToStripe = async (req, res) => {
  let { number, cvc, exp_year, exp_month } = req.body;
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      number: number,
      exp_month: exp_month,
      exp_year: exp_year,
      cvc: cvc,
    },
  });

  res.status(200).json({ paymentMethod });
  // console.log(paymentMethod)
};

exports.addCardToStripeCustomer = async (req, res) => {
  let { number, cvc, exp_year, exp_month, name } = req.body;

  let customerId = await getCustomerIdByUserId(req.user.id);
  const token = await stripe.tokens.create({
    card: {
      name: name,
      number: number,
      exp_month: exp_month,
      exp_year: exp_year,
      cvc: cvc,
    },
  });

  console.log(token);
  // get customer id from the db
  const card = await stripe.customers.createSource(customerId.customer_id, {
    source: token.id, // Use an actual token or card ID here
  });

  res.status(200).json({ card });
  // console.log(paymentMethod)
};
// this is use for transferring amount from admin to user
exports.createTransfer = async (data) => {
  try {
    // Extract necessary fields from the request body
    const { destination, amount } = data;

    // Validate that destination and amount are not empty
    if (!destination || !amount) {
      return res
        .status(400)
        .json({ error: "Destination and amount are required" });
    }

    console.log(destination, amount, " this is for the transaction");

    // Ensure that the amount is a valid number
    const roundedAmount = Math.round(parseFloat(amount) * 100);

    const transfer = await stripe.transfers.create({
      amount: roundedAmount,
      currency: "usd",
      destination: destination, // Assuming 'destination' is an object with a 'destination' property
    });

    return res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    // Handle exceptions and log the error

    // Return a custom error response
    return res.status(400).json({ error: error.message });
  }
};
// get all cards for customers
exports.getAllCard = async (req, res) => {
  // let customer_id = req.body.customer_id
  let userId = req.user.id;

  let customerId = await getCustomerIdByUserId(req.user.id);

  console.log("data is fetched", customerId.customer_id);
  let cards = await stripe.customers.listSources(customerId.customer_id, {
    object: "card",
  });

  console.log(cards, "--cards-");

  var user = await findUser({ _id: userId });

  for (const iterator of cards?.data) {
    iterator.user = user ? user : null;
  }

  return res.status(200).json({ cards });
};

exports.getCard = async (req, res) => {
  let { pm_id } = req.body;
  const paymentMethod = await stripe.paymentMethods.retrieve(pm_id);
  res.status(200).json({ paymentMethod });
};
// pay the amount to the connected account
exports.checkoutSession = async (req, res) => {
  const { account_id, amount, title, currency, quantity, mobile } = req.query;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        name: title,
        amount: Math.round(amount) * 100,
        currency,
        json,
      },
    ],
    payment_intent_data: {
      /**
       * Multiplying by 100 because otherwise for example,
       * 149 becomes 1.49 on Stripe
       */
      application_fee_amount: appFee * 100,
      transfer_data: {
        destination: accountId,
      },
    },
    mode: "payment",
    success_url: `${host}/pay-out${accountId ? "-mobile" : ""}?result=success`,
    cancel_url: `${host}/pay-out${accountId ? "-mobile" : ""}?result=failure`,
  });
  res.status(200).json({ session });
};
// logout user for web
exports.logout = async (req, res, next) => {
  req.session = null;
  generateResponse(null, "Logout successful", res);
};

exports.chargeFromUser = async (req, res) => {
  try {
    // Get customer ID by user ID
    let customerId = await getCustomerIdByUserId(req.user.id);

    // Extract necessary fields from the request body
    const { amount, cardId } = req.body;

    // Validate that amount and cardId are provided
    if (!amount || !cardId) {
      return res.status(400).json({ error: "Amount and cardId are required" });
    }

    const charge = await stripe.charges.create({
      amount: Math.round(amount) * 100,
      currency: "usd",
      source: cardId,
      customer: customerId.customer_id,
    });

    res.status(200).json({ success: true, data: charge });
  } catch (error) {
    // Handle exceptions and log the error
    console.error("Error charging from user:", error.message);

    // Return a custom error response
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getUserDetails = async (req, res, next) => {
  const { userId } = req.body;
  const loginUserId = req.user.id;

  console.log("this is data use it", userId, loginUserId);

  if (!userId)
    return next({
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: "user id is requried",
    });

  try {
    // check if user is blocked
    const isBlocked = await findBlockUser({
      userId: userId,
      blockId: loginUserId,
    });

    if (isBlocked)
      return next({
        statusCode: STATUS_CODE.CONTENT_NOT_AVAILABLE,
        message: "Blocked user",
      });

    const user = await findUserForMe(userId)
      .populate("albumImages")
      .populate("awardImages")
      .populate("profileBackdropImages");

    console.log(user);
    if (!user)
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User not found",
      });

    generateResponse(user, "User fetched successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};
// reset password
exports.resetPassword = async (req, res, next) => {
  const body = parseBody(req.body);

  const { error } = resetPasswordValidation.validate(body);
  if (error)
    return next({
      statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
      message: error.details[0].message,
    });

  let { password } = body;
  const { id } = req.user;

  try {
    const hashedPassword = await hash(password, 10);
    password = hashedPassword;

    const user = await updateUserById(id, { $set: { password } });
    generateResponse(user, "Password updated successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

// upload image
exports.uploadImage = async (req, res, next) => {
  const { id } = req.user;
  const { file } = req;

  if (!file)
    return next({
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: "Image is required",
    });
  const image = `users/${req.file?.filename}`;

  try {
    let user = await updateUserById(id, { $set: { image } });
    if (!user)
      return next({
        statusCode: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Something went wrong",
      });
    generateResponse(user, "Profile image updated successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

// get a user with noOfFollowers, noOfFollowing, isFollowing, isFollower
exports.getUser = async (req, res, next) => {
  const { userId } = req.params;
  const loginUserId = req.user.id;

  if (!userId)
    return next({
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: "Invalid data",
    });

  try {
    // check if user is blocked
    const isBlocked = await findBlockUser({
      userId: userId,
      blockId: loginUserId,
    });

    if (isBlocked)
      return next({
        statusCode: STATUS_CODE.CONTENT_NOT_AVAILABLE,
        message: "Blocked user",
      });

    const user = await getUserProfile(userId, loginUserId);
    if (!user)
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User not found",
      });

    generateResponse(user, "User fetched successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

// update user
exports.updateUser = async (req, res, next) => {
  const userId = req.user.id;

  const body = parseBody(req.body);
  if (!Object.keys(body).length)
    return next({
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: "Invalid data",
    });

  try {
    // update password
    if (body.password) {
      const { password } = body;
      const hashedPassword = await hash(password, 10);
      body.password = hashedPassword;
    }

    const user = await findUser({ _id: userId });
    if (!user)
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User not found",
      });

    // if user doesn't have location lat lng then body must contain lat lng otherwise it will throw error
    if (!user.location?.coordinates?.length > 0 && (!body.lat || !body.lng))
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Location (lat, lng) are required",
      });

    // handle location object
    if (body.lat && body.lng) {
      body.location = {
        type: "Point",
        coordinates: [body.lng, body.lat],
      };
    }

    let updatedUser = await updateUserById(userId, { $set: body });
    generateResponse(updatedUser, "User updated successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.updateProfile = async (req, res, next) => {
  const body = parseBody(req.body); // Parse the request body first
  const {
    full_name,
    phone_number,
    location,
    facebook,
    instagram,
    userId,
    longitude,
    latitude,
    bio,
  } = body;

  const { error } = updateProfileValidation.validate(body);
  if (error) {
    return next({
      status: false,
      statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
      message: error.details[0].message,
    });
  }

  // Check if there are any fields to update
  if (!Object.keys(body).length) {
    return next({
      staus: false,
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: "Invalid data",
    });
  }
  console.log("this is role", req.user.role);
  // Validate the request body
    try {
      let updateFields = {};
      // Update other fields from the request body
      updateFields.fullName = full_name;
      updateFields.phone_number = phone_number;
      updateFields.facebook = facebook;
      updateFields.instagram = instagram;
      updateFields.bio = bio;

      updateFields.address = location;

      // Check if longitude and latitude are provided
      if (longitude && latitude) {
        // Convert longitude and latitude to numbers
        let long = parseFloat(longitude);
        let lat = parseFloat(latitude);
        // Set location field as a geospatial point
        updateFields.coordinates = {
          type: "Point",
          coordinates: [long, lat],
        };
        // If location is provided as a string, set it directly
      }
      if (!req.files) {
        return next({
          status: false,
          statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
          message: "no file attached",
        });
      }
      if (req.files && req.files.profile_image) {
        console.log("we are inside profile image");
        const profileImageFile = req.files.profile_image[0];
        const profileImage = new MediaModel({
          file: profileImageFile.path,
          fileType: "Image", // Assuming award images are always images
          userId: userId,
        });
        const savedProfileImage = await profileImage.save();
        console.log("we are inside profile image", savedProfileImage);

        updateFields.profileImage = savedProfileImage._id;
      }
      updateFields.is_completed = true;

      console.log("this is updated user");
      let User = await updateUserById(req.user.id, {
        $set: updateFields,
      }).populate("ssn_image profileImage backgroundImage");

      const token = generateToken(User);

      generateResponse(
        { User, token },
        "Profile updated successfully",
        res
      );
    } catch (error) {
      next(new Error(error.message));
    }
  
};

// get all users except logged in user and admin
exports.fetchUsersExceptBlocked = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const { q } = req.body || "";
  const userId = req.user.id;

  try {
    const data = await getUsersExceptBlocked({ page, limit, userId, q });
    generateResponse(data, "Users fetched successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

// block or unblock user
exports.blockToggle = async (req, res, next) => {
  const userId = req.user.id;
  const { blockId } = req.body;
  if (!blockId)
    return next({
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: "User id is required",
    });

  try {
    const blockExist = await findBlockUser({ userId, blockId });
    if (blockExist) {
      const deletedObj = await unblockUser({ userId, blockId });
      if (deletedObj) {
        return generateResponse(blockExist, "Unblock successfully", res);
      }
    }

    const blockObj = await blockUser({ userId, blockId });
    if (blockObj) {
      generateResponse(blockObj, "Block successfully", res);
    }
  } catch (error) {
    next(new Error(error.message));
  }
};

// search users by fullName, email, mobile
exports.fetchUsersExceptCurrentAndAdmin = async (req, res, next) => {
  const { q } = req.body || "";
  const userId = req.user.id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const users = await searchUsersExceptCurrentAndAdmin({
      page,
      limit,
      userId,
      q,
    });
    generateResponse(users, "Users fetched successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getMyTenants = async (req, res, next) => {
  try {
    let data = await fin;
  } catch (error) {}
};

exports.activeInactiveToggle = async (req, res, next) => {
  const { userId, isActive } = req.body;
  if (!userId)
    return next({
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: "User id is required",
    });

  try {
    const updatedUser = await updateUserById(userId, { $set: { isActive } });
    if (!updatedUser)
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User not found",
      });

    generateResponse(updatedUser, `User updated successfully`, res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getProfileById = async (req, res, next) => {
  try {
    let { id } = req.params;
    const User = await findUser({ _id: id });
    console.log(User);
    if (!User)
      return next({
        data: {
          status: false,
        },
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "User not exists",
      });

    if (User.role === ROLES.OWNER) {
      let property = await getPropertyForOwner({ user_id: User._id });
      let reviews = await getReview({
        receiverId: User._id,
        parentId: null,
      }).populate({
        path: "userId",
        populate: {
          path: "profileImage ssn_image backgroundImage",
        },
      });

      console.log(property);
      // login successful with cookie-session
      // req.session.userId = user._id;        // req.session.email = email;
      generateResponse(
        { User, property, reviews },
        "LandLord Details  Fetched Successful",
        res
      );
    } else {
      // let User = await findUser({ _id: user._id });
      let reviews = await getReview({
        receiverId: User._id,
        parentId: null,
      }).populate({
        path: "userId",
        populate: {
          path: "profileImage ssn_image backgroundImage",
        },
      });
      let currentLandLord = await findRents({
        tenantId: User._id,
        status: STATUS.STARTED,
      });
      generateResponse(
        { User, reviews, currentLandLord: currentLandLord?.receiverId },
        "Tenant Details  Fetched Successful",
        res
      );
    }
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.uploadBackgroudImage = async (req, res, next) => {
  const { id } = req.user;
  const { file } = req;
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>", file);
  if (!file)
    return next({
      statusCode: STATUS_CODE.BAD_REQUEST,
      message: "Image is required",
    });
  const image = `uploads/users/${req.file?.filename}`;
  const backgroundImage = new MediaModel({
    file: image,
    fileType: "Image", // Assuming award images are always images
    userId: id,
  });
  backgroundImage.save();
  try {
    let user = await updateUserById(id, {
      $set: { backgroundImage: backgroundImage._id },
    }).populate("backgroundImage");
    if (!user)
      return next({
        statusCode: STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: "Something went wrong",
      });
    generateResponse(user, "Profile image updated successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.NotificationOn = async (req, res, next) => {
  try {
    let { isNotification } = req.body;
    let { error } = IsNotificationValidator.validate(req.body);

    if (error) {
      const errorMessage =
        error.details && error.details[0]
          ? error.details[0].message
          : "Validation error";
      return next({
        status: false,
        statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
        message: errorMessage,
      });
    }

    let updatedUser = await updateUserById(req.user.id, {
      isNotification: isNotification,
    });
    let data = await findUserForMe(req.user.id).select("isNotification");
    if (updatedUser) {
      generateResponse(data, "Notification Updated Successfully", res);
    }
  } catch (error) {
    next(new Error(error));
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    let userId = req.user.id;
    if (req.user.role === "owner") {
      //soft delete
      await updateUserById(userId, { isDeleted: true });
      await updateProperty(userId);
      await updateManyReviews(userId);
      await updateMessages({ sender: userId }, { deletedBy: userId });
      await updateChats({ users: { $in: userId } }, { deletedBy: userId });

      // hard delete
      await deleteOTPs(req.user.email);
      await deleteAllNotification(userId);

    } else {
      
      await updateUserById(userId, { isDeleted: true });
      await updateManyReviews(userId);
      await updateMessages({ sender: userId }, { deletedBy: userId });
      await updateChats({ users: { $in: userId } }, { deletedBy: userId });

      // hard delete
      await deleteOTPs(req.user.email);
      await deleteAllNotification(userId);
    }
    generateResponse({}, "User Deleted Successfully", res);

  } catch (error) {
    next(new Error(error));
  }
};

exports.getAllUsers = async (req, res, next) => {
  try{
    // let data = await getAllUsers();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the offset
    const offset = (page - 1) * limit;

    // Fetch the total count of items
    const totalItems = await getUserCount();

    // Fetch the paginated data
    let data = await getAllUsers({
        limit,
        offset
    }).populate("profileImage")

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Create the paginated response
    const paginatedResponse = {
        data,
        meta: {
            totalItems,
            totalPages,
            currentPage: page,
            pageSize: limit
        }
    };
    generateResponse(paginatedResponse, "users fetched successfully", res)
  }catch(error){
    next(new Error(error.message))
  }
}