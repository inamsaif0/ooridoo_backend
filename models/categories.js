'use strict';

let { Schema, model } = require("mongoose");
const {getCategorySearchQuery} = require("../queries/user")
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const { getMongooseAggregatePaginatedData } = require('../utils/index')
const categorySchema = new Schema({
  title: { type: String, required: true },
  media: { type: Schema.Types.ObjectId, ref: "Media", required: true },
}, { timestamps: true });

categorySchema.plugin(mongoosePaginate);
categorySchema.plugin(aggregatePaginate);

const CategoryModel = model('category', categorySchema);

// Export model functions
exports.addCategory = (obj) => CategoryModel.create(obj);
exports.getCategory = (query) => CategoryModel.findOne(query).populate('media');
exports.getCategoryById = (id) => CategoryModel.findById(id)
exports.getCategories = (query) => CategoryModel.find(query).populate('media');
exports.updateCategoryById = (id, update) => CategoryModel.findByIdAndUpdate(id, update, { new: true }).populate('media');
exports.deleteCategoryById = (id) => CategoryModel.findByIdAndDelete(id);
exports.searchCatrgories = async ({ page, limit, q }) => {
  const { data, pagination } = await getMongooseAggregatePaginatedData({
      model: CategoryModel,
      query: getCategorySearchQuery(q),
      page,
      limit,
  });

  return { result: data, pagination };
}