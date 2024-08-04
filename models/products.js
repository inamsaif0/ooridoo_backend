'use strict';

let { Schema, model } = require("mongoose");

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  productType: { type: String, required: true },
  media: [{type: Schema.Types.ObjectId, ref: "media", default: null}],
  sku: {type: String, default: null},
  brandName: { type: String, default: null},
  category: {type: Schema.Types.ObjectId, ref: 'categories', default: null},
  price: {type: Number, default: null}
}, { timestamps: true });

const productModel = model('products', productSchema);

exports.addProduct = (obj) => productModel.create(obj);

exports.updateProductById = (id,query) => productModel.findByIdAndUpdate(id,query);

exports.getProduct = (query) => productModel.findOne(query);

exports.getProducts = () => productModel.find({});

exports.deleteProduct = (id) => productModel.deleteOne({_id: id});

exports.deleteProducts = (email) => productModel.deleteMany({ email });
