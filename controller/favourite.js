const {
  createFavorite,
  getFavorite,
  updateFavorite,
  findFavorite,
  findFavoriteById,
  insertManyFavorite,
  removeFavourite
} = require("../models/favourite");
const { findUser } = require("../models/user");
const { getProductById } = require("../models/products");
const { parseBody, generateResponse } = require("../utils/index");
const { STATUS_CODE } = require("../utils/constants");

exports.addToFavourite = async (req, res, next) => {
  try {
    const { productId, device_token } = parseBody(req.body);
    const product = await getProductById(productId);

    if (!product) {
      return next({ statusCode: STATUS_CODE.BAD_REQUEST, message: "No Property Found" });
    }

    const favoriteQuery = device_token
      ? { productId, device_token }
      : { productId, userId: req.user.id };

    const favorite = await getFavorite(favoriteQuery);

    if (favorite.length > 0) {
      return next({ statusCode: STATUS_CODE.BAD_REQUEST, message: "Already in favorite list" });
    }

    if (!device_token) {
      const userExists = await findUser({ _id: req.user.id });
      if (!userExists) {
        return next({ statusCode: STATUS_CODE.BAD_REQUEST, message: "User does not exist" });
      }
    }

    const addtoFavourite = await createFavorite(favoriteQuery);
    generateResponse(addtoFavourite, "Added to Favourite Successfully", res);
  } catch (error) {
    console.error('Error in addToFavourite:', error);
    next(new Error(error.message));
  }
};


exports.removeFromFavorite = async (req, res, next) => {
  try {
    const {favouriteId } = parseBody(req.body);

    const favorites = await findFavorite(favouriteId);
    console.log(favorites)
    if (!favorites) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "The item you want to remove does not exist",
      });
    }

    await removeFavourite({ _id: favouriteId });
    generateResponse({}, "Removed From Favourite Successfully", res);
  } catch (error) {
    next(new Error(error.message));
  }
};

exports.getFavourite = async (req, res, next) => {
  try {
    const { device_token } = req.query;
    const userId = req.user?.id; // Assuming `userId` is available from `req.user`

    if (!device_token && !userId) {
      return next({
        statusCode: STATUS_CODE.BAD_REQUEST,
        message: "Device token or user ID is required",
      });
    }

    let favorites;

    if (device_token) {
      favorites = await getFavorite({ device_token });
    } else {
      favorites = await getFavorite({ userId });
    }

    generateResponse(favorites, "Favorites retrieved successfully", res)

  } catch (error) {
    console.error('Error in getFavourite:', error);
    next(new Error(error.message));
  }
};
