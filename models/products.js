'use strict';

let { Schema, model } = require("mongoose");
const { getProductSearchQuery } = require("../queries/user")
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const { getMongooseAggregatePaginatedData } = require('../utils/index')
const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  productType: { type: String, required: true },
  media: [{type: Schema.Types.ObjectId, ref: "Media", default: null}],
  sku: {type: String, default: null},
  brandName: { type: String, default: null},
  category: {type: Schema.Types.ObjectId, ref: 'category', default: null},
  subCategory: {type: Schema.Types.ObjectId, ref: 'subcategory', default: null},
  childSubCategory: {type: Schema.Types.ObjectId, ref: 'childsubcategory', default: null},
  reChildSubCategory: {type: Schema.Types.ObjectId, ref: 'rechildsubcategory', default: null},
  language: { type: String, default: null},
  dimension:{type: String, default: null},
  author: {type: String, default: null},
  noofpages: {type: Schema.Types.Number, default: 0},
  price: {type: String, default: null},
  quantity: {type: Number, default: 0}
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);
productSchema.plugin(aggregatePaginate);

const productModel = model('products', productSchema);

exports.addProduct = (obj) => productModel.create(obj);

exports.updateProductById = (id,query) => productModel.findByIdAndUpdate(id,query,{ new: true });

exports.getProduct = (query) => productModel.findOne(query);

exports.getProductById = (id) => productModel.findOne({_id: id}).populate("media category subCategory")

exports.getProducts = () => productModel.find({}).populate("media");

exports.deleteProduct = (id) => productModel.deleteOne({_id: id});

exports.deleteProducts = (email) => productModel.deleteMany({ email });

exports.getProductImages = (id) => productModel.findById(id).populate("media").select("media -_id")

exports.searchProducts = async ({ page, limit, q, category,language, subcategory,reChildSubCategory, childSubCategory, userId, device_token }) => {
  const { data, pagination } = await getMongooseAggregatePaginatedData({
      model: productModel,
      query: getProductSearchQuery(q, category, subcategory,childSubCategory, reChildSubCategory,language, userId, device_token),
      page,
      limit,
  });

  return { result: data, pagination };
}

