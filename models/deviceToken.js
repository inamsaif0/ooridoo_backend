// deviceTokenModel.js
const { Schema, model } = require("mongoose");

const deviceTokenSchema = new Schema({
    token: { type: String, required: true },
    platform: { type: String, enum: ['iOS', 'Android'], required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming you have a User model
}, { timestamps: true });

const DeviceToken = model("DeviceToken", deviceTokenSchema);

module.exports = DeviceToken;
