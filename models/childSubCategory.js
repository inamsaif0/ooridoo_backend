'use strict';

let { Schema, model } = require("mongoose");
const {getSubCategorySearchQuery} = require("../queries/user")
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { getMongooseAggregatePaginatedData } = require('../utils/index')

const subChildCategorySchema = new Schema({
  title: { type: String, required: true },
  media: { type: Schema.Types.ObjectId, ref: "Media", required: true },
  subcategoryId: [{type: Schema.Types.ObjectId, ref: 'rechildsubcategory', require: true}],
}, { timestamps: true });

subChildCategorySchema.plugin(mongoosePaginate);
subChildCategorySchema.plugin(aggregatePaginate);

const ChildSubCategoryModel = model('childsubcategory', subChildCategorySchema);

// Export model functions
exports.addChildSubCategory = (obj) => ChildSubCategoryModel.create(obj);
exports.getChildSubCategory = (query) => ChildSubCategoryModel.findOne(query).populate('media');
exports.getChildSubCategoryById = (id) => ChildSubCategoryModel.findById(id)
exports.getChildSubCategories = (query) => ChildSubCategoryModel.find(query).populate('media');
exports.updateChildSubCategoryById = (id, update) => ChildSubCategoryModel.findByIdAndUpdate(id, update, { new: true }).populate('media');
exports.deleteChildSubCategoryById = (id) => ChildSubCategoryModel.findByIdAndDelete(id);
exports.searchChildSubCatrgories = async ({ page, limit, q }) => {
  const { data, pagination } = await getMongooseAggregatePaginatedData({
      model: ChildSubCategoryModel,
      query: getSubCategorySearchQuery(q),
      page,
      limit,
  });

  return { result: data, pagination };
}