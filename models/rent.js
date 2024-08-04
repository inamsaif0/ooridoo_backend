'use strict';

let { Schema, model, mongoose } = require("mongoose");
const { REQUEST_TYPE, RENT_STATUS,TIME_STATUS , STATUS} = require("../utils/constants");
const path = require("path");

const rentSchema = new Schema({
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'user', default: null},
    tenantId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    time_status: { type: String, enum: Object.values(TIME_STATUS),default: TIME_STATUS.DUE },
    type: { type: String, enum: Object.values(REQUEST_TYPE), default:REQUEST_TYPE.PROPERTY },
    status: { type: String, enum: Object.values(STATUS), default: STATUS.NOT_STARTED},
    due_status: { type: String, enum: Object.values(RENT_STATUS), default:RENT_STATUS.UNPAID },
    price: { type: Number, default: null },
    startingDate: { type: Date, required: true },
    endingDate: { type: Date, required: true },
    paidOnDate: { type: Date, default: null},
    isDeleted: {type: Boolean, default: false}
}, { timestamps: true });

const RentModel = model("rent", rentSchema);

// create new transaction
exports.createRent = (obj) => RentModel.create(obj)
exports.allrent = (obj) => RentModel.find(obj).populate({path:"propertyId", populate:{
  path: "media"
}}).populate({path:"tenantId", populate:{
  path:"profileImage ssn_image"
}})
// get all transactions
// exports.getRequest = (query) => {
//   return RequestModel.find(query)
//       .populate({
//           path: 'senderId',
//           populate: {
//               path: 'profileImage ssn_image'
//           }
//       })
//       .populate({
//           path: 'propertyId',
//           populate: {
//               path: 'media'
//           }
//       });
// };


// exports.getRequests = (id, status) => RentModel.aggregate([
//     {
  
//       $match: {
//         receiverId: mongoose.Types.ObjectId(id),
//         status: 'pending'
//       }
    
//     },
//     {
//       $lookup: {
//         from: "properties",
//         localField: "propertyId",
//         foreignField: "_id",
//         as: "RequestedProperties"
//       }
//     },
//     {
//       $unwind: "$RequestedProperties"
//     },
//     {
//       $lookup: {
//         from: "media",
//         localField: "RequestedProperties.media",
//         foreignField: "_id",
//         as: "RequestedProperties.media"
//       }
//     },
//     {
//       $group: {
//         _id: "$RequestedProperties._id",
//         property: { $first: "$RequestedProperties" }
//       }
//     },
//     {
//       $replaceRoot: { newRoot: "$property" }
//     }
//   ]
//   );
  
exports.updateRents = (id, body) => RentModel.findByIdAndUpdate(id, { $set: body})

  // find transaction
exports.findRents = (query) => RentModel.findOne(query).populate({path: 
  "receiverId", select:"fullName phone_number"

  // populate: {
  //   path: "ssn_image profileImage backgroundImage"
  // }
});

exports.findRentsById = (query) => RentModel.findById(query).populate('receiverId');

// insert many transactions
exports.insertManyRents = (transactions) => RentModel.insertMany(transactions);
exports.updateMyRents = (query, update) => RentModel.updateMany(query, update);

