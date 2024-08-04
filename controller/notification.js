'use strict';

const { generateResponse, parseBody ,sendNotificationToAll} = require('../utils');
const {
    createNotification,
    findNotifications,
    updateNotifications,
} = require('../models/notification');
const { STATUS_CODE } = require('../utils/constants');
const { getNotificationsQuery } = require('../queries/notification');
const { populate } = require('dotenv');

// create new notification
exports.createNotification = async (req, res, next) => {
    const sender = req.user.id;
    const body = parseBody(req.body);

    try {

        sendNotificationToAll({title:"test", body:"sss", fcmTokens:["dDYP2duERAa5-nVc3YcZsw:APA91bEiefiD22Ob7zoSmGAhKOGOYP4u9s84csqsTYhs2N_7DXN95kbZCM_rodd5vpd6begdGbbVTH56nmQGjwVUlRtRsLhTPgvBYCzYoPFLpbHccHKtcc79AiIjLt9DiDHrZ3ytFAe-"]})
        // const notification = await createNotification({ ...body, sender });
        // if (!notification) return next({ statusCode: STATUS_CODE.BAD_REQUEST, message: 'Notification not created' });
        generateResponse("notification", 'Notification created successfully', res);
    } catch (error) {
        next(new Error(error.message));
    }
};

// find notifications by receiverId
exports.getNotifications = async (req, res, next) => {
    const userId = req.user.id;

    const { page = 1, limit = 10 } = req.query;
    const query = getNotificationsQuery(userId);
    const populate = {path:'sender', populate: "ssn_image profileImage backgroundImage"};

    try {
        // update notification isRead=true
        let notifications = await findNotifications({
            userId,
            query,
            page,
            limit,
            populate
        });
        
         generateResponse(notifications, 'Notifications found successfully', res);
        
        
        // Execute the aggregation query
        notifications = await updateNotifications({ 'receivers.user': userId }, {
            $set: { 'receivers.$.isRead': true }
        });
        



    } catch (error) {
        next(new Error(error.message));
    }
}

