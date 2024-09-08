const axios = require('axios');
const { createOrder, getOrder } = require('../models/order'); // Make sure the path is correct
const { generateResponse } = require('../utils');

exports.createOrder = async (req, res) => {
    try {
        // Extract data from the request body
        const { amount, products, userId } = req.body;

        // Step 1: Create the order in the database
        const order = await createOrder({
            products, // Array of products with productId, quantity, etc.
            userId,
            paymentStatus: 'pending', // Default status as payment is pending
            deliveryStatus: 'not-delivered'
        });

        // Step 2: If order creation is successful, proceed with payment request to Toss Payments API
        const paymentResponse = await axios.post(
            'https://api.tosspayments.com/v1/payments',
            {
                method: "CARD",
                amount,
                orderId: order?._id, // This orderId should match with your saved order or external payment system ID
                orderName: "Test",
                successUrl: "http://localhost:8080/success",
                failUrl: "http://localhost:8080/fail",
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

exports.getAllOrders = async (req, res, next) => {
    try {
        let orders = await getOrder({})
        generateResponse(orders, "orders fetched successfully", res)
    } catch (err) {
        next(new Error(err.message))
    }
}