'use strict';

let { Schema, model, mongoose } = require("mongoose");
const { PAYMENT_STATUS, REQUEST_STATUS, REQUEST_TYPE, FAVORTIRE_TYPE } = require("../utils/constants");
const { query } = require("express");
const path = require("path");
const { populate } = require("dotenv");

const favoriteSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', default: null},
    productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    device_token: { type: String, default: null},
    type: { type: String},
}, { timestamps: true });

const FavoriteModel = model("favorite", favoriteSchema);

// create new transaction
exports.createFavorite = (obj) => FavoriteModel.create(obj)

// get all transactions
exports.getFavorite = (query) => 
  FavoriteModel.find(query)
    .populate({
      path: "productId",
      populate: {
        path: "media category"
      }
    })

exports.updateFavorite = (id, body) => FavoriteModel.findByIdAndUpdate(id, { $set: body})

// find transaction
exports.findFavorite = (id) => FavoriteModel.findOne({_id: id});

exports.findFavoriteById = (query) => FavoriteModel.findById(query);

exports.removeFavourite = (query) => FavoriteModel.deleteOne(query)
// insert many transactions
exports.insertManyFavorite= (transactions) => FavoriteModel.insertMany(transactions);

