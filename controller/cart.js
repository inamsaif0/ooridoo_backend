const {
    createCart,
    getCart,
    updateCart,
    findCart,
    findCartById,
    removeCart
} = require("../models/cart");
const { generateResponse } = require("../utils");

exports.addToCart = async (req, res, next) => {
    try {
        const { productId, userId, device_token } = req.body;
        let updated;

        // Determine the query based on whether userId or device_token is provided
        const query = userId ? { productId, userId } : { productId, device_token };

        let cart = await findCart(query);
        console.log(cart)
        if (cart) {
            let count = cart.count
            count++
            updated = await updateCart(cart._id, {count});
        } else {
            updated = await createCart({
                userId,
                device_token,
                productId,
                count: 1
            });
        }

        generateResponse(updated, "Item added to cart", res);
    } catch (error) {
        next(new Error(error.message));
    }
};

exports.updateCartCount = async (req, res, next) => {
    try {
        const { cartId, count } = req.body;

        // Validate that count is a positive integer
        if (!Number.isInteger(count) || count < 1) {
            return next(new Error("Count must be a positive integer"));
        }

        let cart = await findCartById(cartId);

        if (!cart) {
            return next(new Error("Cart not found"));
        }

        // Update the count based on the user's input
        let updated = await updateCart(cart._id, {count: count});
    

        generateResponse(updated, "Cart item quantity updated successfully", res);
    } catch (error) {
        next(new Error(error.message));
    }
};
exports.getCart = async (req, res, next) => {
    try {
        const { userId, device_token } = req.query;

        const query = userId ? { userId } : { device_token };

        const cart = await getCart(query);

        generateResponse(cart, "Cart retrieved successfully", res);
    } catch (error) {
        next(new Error(error.message));
    }
};

exports.deleteFromCart = async (req, res, next) => {
    try {
        const { cartId } = req.body;

        const cart = await findCartById(cartId);

        if (!cart) {
            return next(new Error("Cart not found"));
        }

        await removeCart({_id:cart._id});

        generateResponse(null, "Item removed from cart", res);
    } catch (error) {
        next(new Error(error.message));
    }
};