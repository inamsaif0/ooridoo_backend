'use strict';

let { Schema, model } = require("mongoose");
const {getSubCategorySearchQuery} = require("../queries/user")
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const { getMongooseAggregatePaginatedData } = require('../utils/index')
const subCategorySchema = new Schema({
  title: { type: String, required: true },
  media: { type: Schema.Types.ObjectId, ref: "Media", required: true },
  subcategoryId: [{ type: Schema.Types.ObjectId, ref: 'childsubcategory'}],
}, { timestamps: true });

subCategorySchema.plugin(mongoosePaginate);
subCategorySchema.plugin(aggregatePaginate);

const SubCategoryModel = model('subcategory', subCategorySchema);

// Export model functions
exports.addSubCategory = (obj) => SubCategoryModel.create(obj);

exports.getSubCategory = (query) => SubCategoryModel.findOne(query).populate('media');
exports.getSubCategoryById = (id) => SubCategoryModel.findById(id)
exports.getSubCategories = (query) => SubCategoryModel.find(query).populate('media');
exports.updateSubCategoryById = (id, update) => SubCategoryModel.findByIdAndUpdate(id, update, { new: true }).populate('media');
exports.deleteSubCategoryById = (id) => SubCategoryModel.findByIdAndDelete(id);
exports.searchSubCatrgories = async ({ page, limit, q }) => {
  const { data, pagination } = await getMongooseAggregatePaginatedData({
      model: SubCategoryModel,
      query: getSubCategorySearchQuery(q),
      page,
      limit,
  });

  return { result: data, pagination };
}