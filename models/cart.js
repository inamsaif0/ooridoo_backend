'use strict';

let { Schema, model, mongoose } = require("mongoose");
const { PAYMENT_STATUS, REQUEST_STATUS, REQUEST_TYPE, FAVORTIRE_TYPE } = require("../utils/constants");
const { query } = require("express");
const path = require("path");
const { populate } = require("dotenv");

const cartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', default: null},
    productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    device_token: {type: String, default:null},
    count: {type: Schema.Types.Number, default: 0}
}, { timestamps: true });

const CartModel = model("cart", cartSchema);

// create new transaction
exports.createCart = (obj) => CartModel.create(obj)

// get all transactions
exports.getCart = (query) => 
  CartModel.find(query)
    .populate({
      path: "productId",
      populate: {
        path: "media category"
      }
    })

    exports.updateCart = (id, body) => CartModel.findByIdAndUpdate(id, { $set: body }, { new: true })    .populate({
      path: "productId",
      populate: {
        path: "media category"
      }
    });

// find transaction
exports.findCart = (query) => CartModel.findOne(query);

exports.findCartById = (query) => CartModel.findById(query);

exports.removeCart = (query) => CartModel.deleteOne(query)
// insert many transactions
exports.insertManyCart = (transactions) => CartModel.insertMany(transactions);

