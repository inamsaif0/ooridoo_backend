'use strict';

const { Schema, model, Types } = require("mongoose");

const orderSchema = new Schema({
  products: [
    {
      productId: { type: Types.ObjectId, ref: 'products', required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true }, // Price per unit
      totalPrice: { type: Number, required: true }, // unitPrice * quantity
    }
  ],
  userId: { type: Types.ObjectId, ref: "user", required: true },
  paymentStatus: { type: String, default: "pending" },
  deliveryStatus: { type: String, default: "not-delivered" },
  paymentId: { type: String, default: null }
}, { timestamps: true });

const OrderModel = model('Order', orderSchema); // Changed from 'OTP' to 'Order'

// Create a new order
exports.createOrder = (obj) => OrderModel.create(obj);

// Find an order by query
exports.getOrder = (query) => OrderModel.findOne(query);

// Get all orders by query
exports.getAllOrders = (query) => OrderModel.find(query);
