'use strict';

let { Schema, model, mongoose } = require("mongoose");
const { PAYMENT_STATUS, REQUEST_STATUS, REQUEST_TYPE, FAVORTIRE_TYPE } = require("../utils/constants");
const { query } = require("express");
const path = require("path");
const { populate } = require("dotenv");

const favoriteSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    type: { type: String, required: true },
}, { timestamps: true });

const FavoriteModel = model("favorite", favoriteSchema);

// create new transaction
exports.createFavorite = (obj) => FavoriteModel.create(obj)

// get all transactions
exports.getFavorite = (query) => 
  FavoriteModel.find(query)
    .populate({
      path: 'propertyId',
      populate: [
        {
          path: 'user_id',
          populate: [
            { path: 'ssn_image' },
            { path: 'profileImage' }
          ]
        },
        { path: 'media' }  // Add this line to populate the media field
      ]
    });

exports.updateFavorite = (id, body) => FavoriteModel.findByIdAndUpdate(id, { $set: body})

// find transaction
exports.findFavorite = (propertyId, userId) => FavoriteModel.findOne({propertyId: propertyId, userId: userId});

exports.findFavoriteById = (query) => FavoriteModel.findById(query);

exports.removeFavourite = (query) => FavoriteModel.deleteOne(query)
// insert many transactions
exports.insertManyFavorite= (transactions) => FavoriteModel.insertMany(transactions);

