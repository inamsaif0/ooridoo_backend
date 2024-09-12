'use strict';

const { Schema, model, Types } = require('mongoose');
const { sign } = require('jsonwebtoken');
const { searchUsersQuery, getUsersExceptBlockedQuery, getUserDataQuery } = require('../queries/user');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const { getMongooseAggregatePaginatedData } = require('../utils/index')
const { ROLES } = require('../utils/constants');
const { string } = require('joi');

const userSchema = new Schema({
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true, select: false },
    fullName: { type: String, default: null },
    phone_number: { type: String },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    profileImage: { type:  String, ref: 'Media', default: null },
    isActive: { type: Boolean, default: true }, 
    is_verified: {type: Boolean, default: true},
    address: { type: String, default: null },
    coordinates: { type: { type: String }, coordinates: [Number]},
    bio: {type: String, default: false},
    is_completed: {type: Boolean, default: true},
    isNotification: {type: String, default: false },
    isDeleted: {type: Boolean, default: false},
    device_tokens: { type: String, default: null  },
    online: { type: Boolean, default: false },
    __v: { type: Number, select: false },
}, { timestamps: true });

// index for location
userSchema.index({ location: "2dsphere" });

// add pagination plugin
userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

const UserModel = model('user', userSchema);

// create new user
exports.createUser = (obj) => UserModel.create(obj);

// find user by query
exports.findUserForMe = (query) => UserModel.findOne({ _id: query });
exports.findUser = (query) => UserModel.findOne(query)
exports.deleteUser = (userId) => UserModel.deleteOne({_id: userId})

exports.getFcmByUserId = (userId) => UserModel.findById(userId, { fcmToken: 1 });

exports.getCustomerIdByUserId = (userId) => UserModel.findById(userId, { customer_id: 1 });

exports.getAccountIdByUserId = (userId) => UserModel.findOne({ _id: userId });
// get fcmTokens
exports.getFcmTokens = async (userIds) => {
    // Query to find users with the specified userIds and project only the fcmToken field
    const usersWithFcmTokens = await UserModel.find({ _id: { $in: userIds } }, 'device_tokens');

    // Extracting the fcmTokens
    const fcmTokens = usersWithFcmTokens.map(user => user.device_tokens);
    return fcmTokens;
}

// update user by id
exports.updateUserById = (userId, obj) => UserModel.findByIdAndUpdate(userId, obj, { new: true });

exports.updateUserCustomerId = (userId, newCustomerId, newAccountId) => {
    return UserModel.findOneAndUpdate({ _id: userId }, { customer_id: newCustomerId, account_id: newAccountId }, { new: true });
};

exports.updateUserStatus = (userId, status) => {
    return UserModel.findOneAndUpdate({ _id: userId }, { is_connected: status }, { new: true });
};

// get all users with pagination // for admin
exports.getUsersExceptBlocked = async ({ page, limit, userId, q }) => {
    const { data, pagination } = await getMongooseAggregatePaginatedData({
        model: UserModel,
        query: getUsersExceptBlockedQuery(userId, q),
        page,
        limit,
    });

    return { result: data, pagination };
}

// generate jwt token
exports.generateToken = (user) => {
    const token = sign({
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    return token;
}

exports.searchUsersExceptCurrentAndAdmin = async ({ page, limit, userId, q }) => {
    const { data, pagination } = await getMongooseAggregatePaginatedData({
        model: UserModel,
        query: searchUsersQuery(userId, q),
        page,
        limit,
    });

    return { result: data, pagination };
}

exports.getUserProfile = async (userId, loginUserId) => {
    const [user] = await UserModel.aggregate(getUserDataQuery(userId, loginUserId));
    return user;
}

// update users
exports.updateUsers = (query, obj) => UserModel.updateMany(query, obj);


exports.updateUser = (query, obj) => UserModel.findOneAndUpdate(query, obj, { new: true });

// get users by max winning for leaderBoard
exports.getMaxWinningUsers = (query) => {
    return UserModel.aggregate([
        { $lookup: { from: "competitions", localField: "competitionWonIds", foreignField: "_id", as: "competitions" } },
        { $match: query },
        { $project: { _id: 1, fullName: 1, email: 1, image: 1, country: 1, winsCount: { $size: "$competitions" } } },
        { $sort: { winsCount: -1 } },
        { $limit: 10 }
    ])
}

// get current user winning rank
exports.getCurrentUserRank = (query, userId) => {
    return UserModel.aggregate([
        { $lookup: { from: "competitions", localField: "competitionWonIds", foreignField: "_id", as: "competitions" } },
        {
            $match: {
                $and: [
                    { ...query },
                    { _id: Types.ObjectId(userId) },
                ]
            }
        },
        {
            $project:
                { _id: 1, fullName: 1, email: 1, image: 1, country: 1, winsCount: { $size: "$competitions" } }
        },
        { $sort: { winsCount: -1 } }
    ])
}

exports.getAllUsers = () => UserModel.find({role: 'user', isActive: true})
exports.getUserCount = () =>  UserModel.countDocuments({role: 'user'})