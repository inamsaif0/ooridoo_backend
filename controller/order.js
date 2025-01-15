const axios = require('axios');
const { createOrder, getOrder, updateOrder, findOrderById } = require('../models/order'); // Make sure the path is correct
const { generateResponse } = require('../utils');
const {deleteManyCarts} = require("../models/cart")
const {STATUS_CODE} = require("../utils/constants")
exports.createOrder = async (req, res, next) => {
    try {
        // Extract data from the request body
        const { amount, products, userId, ShippingAddress, Zipcode } = req.body;

        // Step 1: Create the order in the database
        const order = await createOrder({
            products, // Array of products with productId, quantity, etc.
            userId,
            paymentStatus: 'pending', // Default status as payment is pending
            deliveryStatus: 'not-delivered',
            ShippingAddress,
            Zipcode
        });

        // Step 2: If order creation is successful, proceed with payment request to Toss Payments API
        const paymentResponse = await axios.post(
            'https://api.tosspayments.com/v1/payments',
            {
                method: "CARD",
                amount,
                orderId: order?._id, // This orderId should match with your saved order or external payment system ID
                orderName: "Test",
                successUrl: "https://ooridoo.com/success",
                failUrl: "https://ooridoo.com/failed",
            },
            {
                headers: {
                    Authorization: 'Basic dGVzdF9za196WExrS0V5cE5BcldtbzUwblgzbG1lYXhZRzVSOg==', // Replace with actual credentials
                    'Content-Type': 'application/json',
                },
            }
        );

        // Step 3: Update the order with payment details after successful payment response
        // await OrderModel.updateOne(
        //   { _id: order._id },
        //   { paymentStatus: 'paid', paymentId: paymentResponse.data.paymentKey }
        // );

        // Step 4: Respond with the payment result and the created order

        generateResponse({
            paymentData: paymentResponse?.data
       }, 'Payment and order creation successful', res)
    } catch (error) {
        // Step 5: If payment failed, optionally rollback order creation or mark as failed
        next(new Error(error.message))
    }
};

exports.updateOrder = async (req, res, next) => {
    try{
        let { orderId, paymentId } = req.query;
        let userId = req?.user?.id
        let updated = await updateOrder(orderId, {paymentStatus: "completed", paymentId})
        await deleteManyCarts(userId);
        generateResponse({}, "payment completed successfully", res)
    }catch(err){
        next(new Error(err.message))
    }
}
exports.getAllOrders = async (req, res, next) => {
    try {
        let orders = await getOrder({paymentStatus: "completed"})
        generateResponse(orders, "orders fetched successfully", res)
    } catch (err) {
        next(new Error(err.message))
    }
}

exports.changeOrderDeliveryStatus = async (req, res, next) => {
    try{
        let { orderId } = req.body;
        let data = await findOrderById(orderId);
        if(!data){
            return next({
                status: false,
                statusCode: STATUS_CODE.BAD_REQUEST,
                message: "order is not found",
              });
        }

       let Order =  await updateOrder(orderId, {deliveryStatus: "delivered"})
       generateResponse(Order, "Order Status Updated Successfully", res)
    }catch(error){
        next(new Error(error.message))
    }
}

exports.getAllOrdersByUser = async (req, res, next) => {
    try {

        console.log("this is user>>>>>", req.user.id)
        let orders = await getOrder({paymentStatus: "completed", userId: req.user.id})
        generateResponse(orders, "orders fetched successfully", res)
    } catch (err) {
        next(new Error(err.message))
    }
}