'use strict';

let { Schema, model } = require("mongoose");
const {getSubCategorySearchQuery} = require("../queries/user")
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { getMongooseAggregatePaginatedData } = require('../utils/index')

const ReSubChildCategorySchema = new Schema({
  title: { type: String, required: true },
  media: { type: Schema.Types.ObjectId, ref: "Media", required: true },
}, { timestamps: true });

ReSubChildCategorySchema.plugin(mongoosePaginate);
ReSubChildCategorySchema.plugin(aggregatePaginate);

const ReSubChildCategoryModel = model('rechildsubcategory', ReSubChildCategorySchema);

// Export model functions
exports.addReChildCategory = (obj) => ReSubChildCategoryModel.create(obj);
exports.getReChildCategory = (query) => ReSubChildCategoryModel.findOne(query).populate('media');
exports.getReChildCategoryById = (id) => ReSubChildCategoryModel.findById(id)
exports.getReChildCategories = (query) => ReSubChildCategoryModel.find(query).populate('media');
exports.updateReChildCategoryById = (id, update) => ReSubChildCategoryModel.findByIdAndUpdate(id, update, { new: true }).populate('media');
exports.deleteReChildCategoryById = (id) => ReSubChildCategoryModel.findByIdAndDelete(id);

exports.searchReChildCatrgories = async ({ page, limit, q }) => {
  const { data, pagination } = await getMongooseAggregatePaginatedData({
      model: ReSubChildCategoryModel,
      query: getSubCategorySearchQuery(q),
      page,
      limit,
  });

  return { result: data, pagination };
}