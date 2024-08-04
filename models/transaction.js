'use strict';

let { Schema, model } = require("mongoose");
const { PAYMENT_STATUS } = require("../utils/constants");

const transactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    recieverId: {type: Schema.Types.ObjectId, ref: 'user', required: true},
    propertyId: { type: Schema.Types.ObjectId, ref: 'property', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: Object.values(PAYMENT_STATUS), required: true },
}, { timestamps: true });

const TransactionModel = model("transaction", transactionSchema);
// create new transaction
exports.createTransaction = (obj) => TransactionModel.create(obj);
// get all transactions
exports.getTransactions = (query) => TransactionModel.find(query).populate("userId recieverId propertyId");
// find transaction
exports.findTransaction = (query) => TransactionModel.findOne(query);
// insert many transactions
exports.insertManyTransactions = (transactions) => TransactionModel.insertMany(transactions);

exports.deleteMany = (userId) => TransactionModel.deleteMany({userId: userId});