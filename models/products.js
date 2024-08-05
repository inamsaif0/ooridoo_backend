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
  category: {type: Schema.Types.ObjectId, ref: 'categories', default: null},
  price: {type: Number, default: null}
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);
productSchema.plugin(aggregatePaginate);
const productModel = model('products', productSchema);

exports.addProduct = (obj) => productModel.create(obj);

exports.updateProductById = (id,query) => productModel.findByIdAndUpdate(id,query);

exports.getProduct = (query) => productModel.findOne(query);

exports.getProducts = () => productModel.find({}).populate("media");

exports.deleteProduct = (id) => productModel.deleteOne({_id: id});

exports.deleteProducts = (email) => productModel.deleteMany({ email });

exports.searchProducts = async ({ page, limit, q }) => {
  const { data, pagination } = await getMongooseAggregatePaginatedData({
      model: productModel,
      query: getProductSearchQuery(q),
      page,
      limit,
  });

  return { result: data, pagination };
}
