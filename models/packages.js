'use strict';

let { Schema, model } = require("mongoose");
const { getPackageSearchQuery } = require("../queries/user")
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const { getMongooseAggregatePaginatedData } = require('../utils/index')
const packageSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'products', default: null }],
  media: [{ type: Schema.Types.ObjectId, ref: 'Media', default: null }],
}, { timestamps: true });

packageSchema.plugin(mongoosePaginate);
packageSchema.plugin(aggregatePaginate);

const packageModel = model('packages', packageSchema);

// Export model functions
exports.addPackage = (obj) => packageModel.create(obj);
exports.getPackage = (query) => packageModel.findOne(query).populate('products').populate('media');
exports.getPackages = (query) => packageModel.find(query).populate('products').populate('media');
exports.updatePackageById = (id, update) => packageModel.findByIdAndUpdate(id, update, { new: true }).populate('products').populate('media');
exports.deletePackageById = (id) => packageModel.findByIdAndDelete(id);
exports.getPackagesCount = () => packageModel.countDocuments();
exports.searchPackages = async ({ page, limit, q }) => {
  const { data, pagination } = await getMongooseAggregatePaginatedData({
      model: packageModel,
      query: getPackageSearchQuery(q),
      page,
      limit,
  });

  return { result: data, pagination };
}
