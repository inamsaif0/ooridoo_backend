'use strict';

let { Schema, model } = require("mongoose");
const { PAYMENT_STATUS } = require("../utils/constants");
const { getMongooseAggregatePaginatedData } = require('../utils/index')
const {searchPropertiesQuery} = require("../queries/property")
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { PROPERTY_STATUS } = require('../utils/constants');
const { boolean } = require("joi");
const path = require("path");
const { type } = require("os");

const propertySchema = new Schema({
    title: { type: String, default: null },
    media: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
    description: { type: String, default: null },
    Bedrooms: { type: Number, default: null },
    Bathrooms: { type: Number, default: null },
    size: { type: String, default: null },
    parking: { type: String, default: null },
    farnished: { type: String, default: null },
    coordinates: { type: { type: String }, coordinates: [Number]},
    city:{ type: String, default: null},
    property_type: { type: String, default: null },
    user_id: { type:  Schema.Types.ObjectId, ref: 'user' },
    status: {type : String, default: PROPERTY_STATUS.AVAILABLE },
    price: { type: Number, default: null },
    isDeleted: { type: Schema.Types.Boolean, default: false }
}, { timestamps: true });

propertySchema.index({ coordinates: '2dsphere' });

// add pagination plugin
propertySchema.plugin(mongoosePaginate);
propertySchema.plugin(aggregatePaginate);

const PropertyModel = model('Property', propertySchema);

// create new transaction
const getProperty = (query) => PropertyModel.find(query).populate({path:"user_id", populate: {
  path: "profileImage ssn_image"
}}).populate('media').sort({ createdAt: -1 });

const getPropertys = ( coordinates) => PropertyModel.find({
    coordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coordinates,
          },
          $maxDistance: 5000, // optional, in meters
        },
      }
}).populate({path:"user_id", populate: {
  path: "profileImage ssn_image"
}}).populate('media').sort({ createdAt: -1 });


const getPropertyForOwner = (query) => PropertyModel.find(query).populate('media');

const createProperty = (obj) => PropertyModel.create(obj);
const deleteProperty = (query) => PropertyModel.findByIdAndDelete(query)

const findPropertybyId = (id) => PropertyModel.findOne({_id:id});
const updateProperty = (propertyId, obj) => {
    return PropertyModel.findByIdAndUpdate(propertyId, obj, { new: true });
}



const searchProperty = async ({ page, limit, userId, q }) => {
    const { data, pagination } = await getMongooseAggregatePaginatedData({
        model: PropertyModel,
        query: searchPropertiesQuery(userId, q),
        page,
        limit,
    });
    return { result: data, pagination };
}


module.exports = { getPropertys,getPropertyForOwner,updateProperty, findPropertybyId, createProperty,getProperty,searchProperty, deleteProperty, PropertyModel };


// get all Propertys

// find Property
exports.findProperty = (query) => PropertyModel.findOne(query);

// insert many Propertys
exports.insertManyProperty = (transactions) => PropertyModel.insertMany(transactions);

exports.getthePropertyData = (query) => PropertyModel.find(query).populate('media')

exports.deleteMyAllProperties = (userId) => PropertyModel.updateMany({user_id: userId}, {isDeleted: true});

