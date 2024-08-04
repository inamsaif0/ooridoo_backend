'use strict';

let { Schema, model } = require("mongoose");
const { PAYMENT_STATUS, REVIEW_STATUS } = require("../utils/constants");

const reviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'property', default: null},
    receiverId: {type: Schema.Types.ObjectId, ref: 'user', default: null},
    rating: { type: Number, default: null },
    parentId: { type: Schema.Types.ObjectId, ref: "review", default: null},
    detail: {type: String, required: true},
    type: { type: String, enum: Object.values(REVIEW_STATUS), required: true },
    isDeleted: { type: Boolean, default: false},
}, { timestamps: true });

const ReviewModel = model("review", reviewSchema);

// create new transaction
exports.createReview = (obj) => ReviewModel.create(obj);

// get all transactions
exports.getReview = (query) => ReviewModel.find(query);

// find transaction
exports.findReview = (query) => ReviewModel.findOne(query);

exports.updateReview = (id, body) => ReviewModel.findByIdAndUpdate(id, { $set: body})

exports.updateManyReviews = (userId) => ReviewModel.updateMany({userId}, {isDeleted: true})
// insert many transactions
exports.insertManyReview = (transactions) => ReviewModel.insertMany(transactions);

exports.removeReview = (id) => ReviewModel.findByIdAndDelete(id);
exports.deleteManyReviews = (userId) => ReviewModel.deleteMany({userId: userId})
