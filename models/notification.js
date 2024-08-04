"use strict";

const {
  NOTIFICATION_TYPE,
  NOTIFICATION_RELATED_TYPE,
} = require("../utils/constants");
const { Schema, model, Types } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const {
  getMongoosePaginatedData,
  sendNotificationToAll,
  getMongooseAggregatePaginatedData,
} = require("../utils");
const { getFcmTokens, findUser } = require("./user");
const { boolean } = require("joi");
const { notificationCount } = require("../socket");

const receiversSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    isRead: { type: Boolean, default: false },
  },
  { _id: false }
);

const notificationSchema = new Schema(
  {
    receivers: [receiversSchema],
    sender: { type: Schema.Types.ObjectId, ref: "user" },
    title: { type: String, default: null },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },
    sourceId: { type: Schema.Types.ObjectId, default: null },
    relatedId: { type: String, default: null },
    image: { type: String, default: null },
    relatedType: {
      type: String,
      enum: Object.values(NOTIFICATION_RELATED_TYPE),
      required: true,
    },
  },
  { timestamps: true }
);

// add pagination plugin
notificationSchema.plugin(mongoosePaginate);
notificationSchema.plugin(aggregatePaginate);

const NotificationModel = model("notification", notificationSchema);

// create new notification
exports.createNotification = (obj) => NotificationModel.create(obj);

// Assuming you have the required imports and schema defined

// Function to delete notifications based on a query
exports.seenNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Use Mongoose's findByIdAndUpdate to update the "seen" status of the notification
    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { seen: true }, // Update the "seen" field to true
      { new: true } // Return the updated notification document
    );

    if (!updatedNotification) {
      // If the notification with the specified ID was not found, return a 404 response
      return res.status(404).json({ message: "Notification not found." });
    }

    // Respond with the updated notification
    res.status(200).json(updatedNotification);
  } catch (error) {
    // Handle any errors and respond with an error message
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAllNotification = async (userIdToDelete) => {
  const updatedNotifications = await NotificationModel.updateMany(
    { "receivers.user": userIdToDelete }, // Find notifications where the user exists in the receivers array
    { $pull: { receivers: { user: userIdToDelete } } }, // Remove the user from the receivers array
    { new: true } // Return the updated documents
  );

  return updatedNotifications;
};

exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const userIdToDelete = req.user.id;

    // Use Mongoose to update the notification by removing the matching receiver
    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { $pull: { receivers: { user: userIdToDelete } } },
      { new: true }
    );

    if (!updatedNotification) {
      // If the notification with the specified ID was not found, return a 404 response
      return res.status(404).json({ message: "Notification not found." });
    }

    // Respond with the updated notification
    res.status(200).json(updatedNotification);
  } catch (error) {
    // Handle any errors and respond with an error message
    res.status(500).json({ error: error.message });
  }
};

//find notifications by receiverId and update isRead to true
const userUnReadNotificationsCount = async ({ userId }) => {
  const pipeline = [
    { $match: { "receivers.user": Types.ObjectId(userId) } },
    { $match: { "receivers.isRead": false } },
    { $count: "count" },
  ];

  const result = await NotificationModel.aggregate(pipeline);
  const count = result?.length > 0 ? result[0].count : 0;
  await notificationCount({ userId, count });
  return true;
};

exports.findNotifications = async ({ query, page, limit, populate }) => {
  const { data, pagination } = await getMongooseAggregatePaginatedData({
    model: NotificationModel,
    query,
    page,
    limit,
  });

  // Separate query to populate the sender field
  await NotificationModel.populate(data, populate);

  return { result: data, pagination };
};

//const notification = await Notification.find({ 'receivers.user': userId });
exports.getNotifications = (query) => NotificationModel.find(query);

exports.updateNotifications = (query, obj) =>
  NotificationModel.updateMany(query, obj, { new: true });

// create and send notification
exports.createAndSendNotification = async ({
  senderObject,
  receiverIds,
  type,
  property,
  sourceId,
  relatedId,
  relatedType,
  Image,
}) => {
  console.log("type from crateAndSendNotification", receiverIds);
  let title, body;

  console.log("hello this is sender", senderObject);
  // console.log(competition)
  // return competition;
  console.log(
    "these are the reciever ids??????????????????????????????",
    receiverIds
  );
  const fcmTokens = await getFcmTokens(receiverIds);
  console.log("fcmTokens from createAndSendNotification >> ", fcmTokens);
  // console.log(competition)

  switch (type) {
    case NOTIFICATION_TYPE.REQUEST_SENT:
      title = "property request sent";
      body = `${senderObject?.fullName} sends a request on your property ${property?.title}`;
      break;

    case NOTIFICATION_TYPE.REQUEST_ACCEPTED:
      title = "property request accepted";
      body = `your request is accepted for property ${property?.title}`;
      break;

    case NOTIFICATION_TYPE.REQUEST_REJECTED:
      title = "property request rejected";
      body = `${senderObject?.fullName} has rejected your request on property ${property?.title}`;
      break;

    case NOTIFICATION_TYPE.RENT_DUE:
      title = "property rent due";
      body = `you have rent due for current month on property ${property?.title}`;
      break;

    case NOTIFICATION_TYPE.RENT_OVERDUE:
      title = "property rent overdue";
      body = `you have rent overdue for current month on property ${property?.title}`;
      break;

    // To implement later in cron job
    // case NOTIFICATION_TYPE.COMPETITION_STARTED:
    //     title = 'Competition started';
    //     body = `Competition ${competition?.title} has started now.`;
    //     break;

    // // To implement later in cron job
    // case NOTIFICATION_TYPE.COMPETITION_COMPLETED:
    //     title = 'Competition completed';
    //     body = `Competition ${competition?.title} has completed, now.`;
    //     break;

    // case NOTIFICATION_TYPE.NEW_FOLLOWER:
    //     title = 'New follower';
    //     body = `${senderObject?.fullName} is now your follower!`;
    //     break;

    // case NOTIFICATION_TYPE.UN_FOLLOW:
    //     title = 'Un-followed';
    //     body = `${senderObject?.fullName} has un-followed you.`;
    //     break;

    // case NOTIFICATION_TYPE.COMMENT_ADDED:
    //     title = 'New comment';
    //     body = `${senderObject?.fullName} has commented on your post in competition ${competition?.title}.`;
    //     break;

    // case NOTIFICATION_TYPE.RECOMMENT_ADDED:
    //         title = 'Re comment';
    //         body = `${senderObject?.fullName} has commented on the post in competition ${competition?.title}.`;
    //         break;

    case NOTIFICATION_TYPE.MESSAGE_SENT:
      title = "New message";
      body = `You have received message from ${senderObject?.fullName}.`;
      break;

    case NOTIFICATION_TYPE.RATING_ADDED:
      title = "New Rating";
      body = `${senderObject?.fullName} has added rating to property.`;
      break;

    case NOTIFICATION_TYPE.RATING_REPLAY:
      title = "Rating Reply";
      body = `${senderObject?.fullName} has replied property .`;
      break;

    default:
      break;
  }

  const receivers = receiverIds.map((id) => {
    return { user: id, isRead: false };
  });

  const notification = await NotificationModel.create({
    receivers,
    sender: senderObject?._id,
    type,
    title: title,
    sourceId: senderObject?._id,
    relatedId: relatedId,
    relatedType,
    image: Image,
  });
  console.log("this is notification",notification)
  let rec = await findUser({_id: receiverIds[0]})
  if(rec?.isNotification === "true"){
  sendNotificationToAll({ title, body, tokens: fcmTokens, notification });
  }
  for (const userId of receiverIds) {
    const some = await userUnReadNotificationsCount({ userId });
    console.log("inaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaam", some);
  }

  return notification;
};
