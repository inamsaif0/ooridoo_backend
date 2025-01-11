'use strict';

let { Schema, model } = require("mongoose");
const {getCategorySearchQuery} = require("../queries/user")
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const { getMongooseAggregatePaginatedData } = require('../utils/index');
const { populate } = require("dotenv");
const categorySchema = new Schema({
  title: { type: String, required: true },
  media: { type: Schema.Types.ObjectId, ref: "Media", required: true },
  subcategoryId: [{ type: Schema.Types.ObjectId, ref: "subcategory"}]
}, { timestamps: true });

categorySchema.plugin(mongoosePaginate);
categorySchema.plugin(aggregatePaginate);

const CategoryModel = model('category', categorySchema);
exports.getNestedCategories = async () => {
  return CategoryModel.find({})
    .populate({
      path: 'media'  // Populates the media in the main category
    })
    .populate({
      path: 'subcategoryId',  // Populates the `subcategoryId` array in Category
      populate: [
        { path: 'media' },  // Populates `media` inside each SubCategory
        {
          path: 'subcategoryId',  // Populates the `subcategoryId` inside each SubCategory
          populate: [
            { path: 'media' },  // Populates `media` inside each ChildSubCategory
            {
              path: 'subcategoryId',  // Populates the `subcategoryId` inside each ChildSubCategory
              populate: [
                { path: 'media' },  // Populates `media` inside each ReSubChildCategory
              ]
            }
          ]
        }
      ]
    });
};





// Export model functions
exports.addCategory = (obj) => CategoryModel.create(obj);

exports.getCategory = (query) => CategoryModel.findOne(query).populate('media');
exports.getCategoryById = (id) => CategoryModel.findById(id)
exports.getCategories = (query) => CategoryModel.find(query).populate('media');
exports.updateCategoryById = (id, update) => CategoryModel.findByIdAndUpdate(id, update, { new: true }).populate('media');
exports.deleteCategoryById = (id) => CategoryModel.findByIdAndDelete(id);
exports.searchCatrgories = async ({ page, limit, q, lookup }) => {
  const { data, pagination } = await getMongooseAggregatePaginatedData({
      model: CategoryModel,
      query: getCategorySearchQuery(q, lookup),
      page,
      limit,
  });

  return { result: data, pagination };
}
