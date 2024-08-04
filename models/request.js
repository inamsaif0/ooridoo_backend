'use strict';

let { Schema, model, mongoose } = require("mongoose");
const { PAYMENT_STATUS, REQUEST_STATUS, REQUEST_TYPE } = require("../utils/constants");
const { query } = require("express");
const path = require("path");

const requestSchema = new Schema({
    senderId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    status: { type: String, enum: Object.values(REQUEST_STATUS), required: true },
    type: { type: String, enum: Object.values(REQUEST_TYPE), default:REQUEST_TYPE.PROPERTY },
    incomingDate: { type: Date, required: true },
    outgoingDate: { type: Date, required: true },
}, { timestamps: true });

const RequestModel = model("request", requestSchema);

// create new transaction
exports.createRequest = (obj) => RequestModel.create(obj)
exports.allrequest = (obj) => RequestModel.find(obj)

// get all transactions
exports.getRequest = (query) => {
  return RequestModel.find(query)
      .populate({
          path: 'senderId', select: "fullName profileImage bio",
          populate: {
              path: 'profileImage', 
          }
      })
      // .populate({
      //     path: 'propertyId',
      //     populate: {
      //         path: 'media'
      //     }
      // });
};


exports.getRequests = (id, status) => RequestModel.aggregate([
    {
  
      $match: {
        receiverId: mongoose.Types.ObjectId(id),
        status: 'pending'
      }
    
    },
    {
      $lookup: {
        from: "properties",
        localField: "propertyId",
        foreignField: "_id",
        as: "RequestedProperties"
      }
    },
    {
      $unwind: "$RequestedProperties"
    },
    {
      $lookup: {
        from: "media",
        localField: "RequestedProperties.media",
        foreignField: "_id",
        as: "RequestedProperties.media"
      }
    },
    {
      $group: {
        _id: "$RequestedProperties._id",
        property: { $first: "$RequestedProperties" }
      }
    },
    {
      $replaceRoot: { newRoot: "$property" }
    }
  ]
);
  
exports.updateRequest = (id, body) => RequestModel.findByIdAndUpdate(id, { $set: body})
exports.deleteManyRequest = (userId) => RequestModel.deleteMany({senderId: userId})

  // find transaction
exports.findRequest = (query) => RequestModel.findOne(query);

exports.findRequestById = (query) => RequestModel.findById(query).populate('receiverId');

// insert many transactions
exports.insertManyRequest = (transactions) => RequestModel.insertMany(transactions);

exports.updateMyProperties = (query, update) => RequestModel.updateMany(query, update);

