'use strict';

let { Schema, model } = require("mongoose");

const guestSchema = new Schema({
  device_token: { type: String, required: true },
}, { timestamps: true });

// OTP will be expired in 20 minutes
// otpSchema.methods.isExpired = function () {
//   return Date.now() - this.createdAt > Number(process.env.OTP_EXPIRATION);
// }

const GuestModel = model('guest', guestSchema);

// create new OTP
exports.addGuest = (obj) => GuestModel.create(obj);

// find OTP by query
exports.getGuest = (query) => GuestModel.findOne(query);

// delete OTP
exports.deleteGuest = (device_token) => GuestModel.deleteMany({ email });
