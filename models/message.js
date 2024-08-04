'use strict';

const { Schema, model, Types } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { getMongoosePaginatedData } = require("../utils");

const messageSchema = new Schema({
  sender: { type: Types.ObjectId, ref: "user", required: true },
  receiver: { type: Types.ObjectId, ref: "user", required: true },
  parent: { type: Types.ObjectId, ref: "message", default: null },
  text: { type: String, required: false, default: null },
  channel: { type: String, required: true },
  media: [{ type: String }],
  isRead: { type: Boolean, default: false },
  deletedBy: { type: Types.ObjectId, ref: "user", default: null },
  isDeletedForEveryone: { type: Boolean, default: false },
  flaggedBy: { type: Types.ObjectId, ref: "user", default: null },
}, { timestamps: true });

messageSchema.plugin(mongoosePaginate);
messageSchema.plugin(aggregatePaginate);

const MessageModel = model("message", messageSchema);

// create new message
exports.createMessage = (obj) => MessageModel.create(obj);

// find messages by query with pagination
exports.findMessages = async ({ query, page, limit, populate }) => {
  const { data, pagination } = await getMongoosePaginatedData({
    model: MessageModel,
    query,
    page,
    limit,
    populate
  });

  return { result: data, pagination };
}

// get messages without pagination
exports.getMessages = (query) => MessageModel.find(query);

// find message by query
exports.findMessageById = (messageId) => MessageModel.findById(messageId);



exports.unSeenMessageCountQuery = (userId) => MessageModel.countDocuments({
  receiver: userId,
  isRead: false
});


exports.unSeenMessageCountByChannelQuery = (userId,channel) => MessageModel.countDocuments({
  receiver: userId,
  channel,
  isRead: false
});


// update message by query
exports.updateMessages = (query, obj) => MessageModel.updateMany(query, obj, { new: true });

// delete message by user
exports.updateMessageById = (messageId, obj) => MessageModel.findByIdAndUpdate(messageId, obj, { new: true });

// delete Message
exports.deleteMessageById = (messageId) => MessageModel.findByIdAndDelete(messageId);