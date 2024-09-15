'use strict';

let { Schema, model } = require("mongoose");
const {getSubCategorySearchQuery} = require("../queries/user")
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const { getMongooseAggregatePaginatedData } = require('../utils/index')
const subCategorySchema = new Schema({
  title: { type: String, required: true },
  media: { type: Schema.Types.ObjectId, ref: "Media", required: true },
  category: { type: Schema.Types.ObjectId, ref: 'category', require: true}
}, { timestamps: true });

subCategorySchema.plugin(mongoosePaginate);
subCategorySchema.plugin(aggregatePaginate);

const SubCategoryModel = model('subcategory', subCategorySchema);

// Export model functions
exports.addCategory = (obj) => SubCategoryModel.create(obj);

exports.getCategory = (query) => SubCategoryModel.findOne(query).populate('media');
exports.getCategoryById = (id) => SubCategoryModel.findById(id)
exports.getCategories = (query) => SubCategoryModel.find(query).populate('media');
exports.updateCategoryById = (id, update) => SubCategoryModel.findByIdAndUpdate(id, update, { new: true }).populate('media');
exports.deleteCategoryById = (id) => SubCategoryModel.findByIdAndDelete(id);
exports.searchCatrgories = async ({ page, limit, q }) => {
  const { data, pagination } = await getMongooseAggregatePaginatedData({
      model: SubCategoryModel,
      query: getSubCategorySearchQuery(q),
      page,
      limit,
  });

  return { result: data, pagination };
}