'use strict';

let { Schema, model } = require("mongoose");

const packageSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'products', default: null }],
  media: [{ type: Schema.Types.ObjectId, ref: 'media', default: null }],
}, { timestamps: true });

const packageModel = model('packages', packageSchema);

// Export model functions
exports.addPackage = (obj) => packageModel.create(obj);
exports.getPackage = (query) => packageModel.findOne(query).populate('products').populate('media');
exports.getPackages = (query) => packageModel.find(query).populate('products').populate('media');
exports.updatePackageById = (id, update) => packageModel.findByIdAndUpdate(id, update, { new: true }).populate('products').populate('media');
exports.deletePackageById = (id) => packageModel.findByIdAndDelete(id);
