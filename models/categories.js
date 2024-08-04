'use strict';

let { Schema, model } = require("mongoose");

const categorySchema = new Schema({
  name: { type: String, required: true },
  media: { type: Schema.Types.ObjectId, ref: "media", required: true },
}, { timestamps: true });

const CategoryModel = model('category', categorySchema);

// Export model functions
exports.addCategory = (obj) => CategoryModel.create(obj);
exports.getCategory = (query) => CategoryModel.findOne(query).populate('media');
exports.getCategories = (query) => CategoryModel.find(query).populate('media');
exports.updateCategoryById = (id, update) => CategoryModel.findByIdAndUpdate(id, update, { new: true }).populate('media');
exports.deleteCategoryById = (id) => CategoryModel.findByIdAndDelete(id);
