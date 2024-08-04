const { Types } = require("mongoose");

// search users by name, email, mobile (aggregate) without current user and admin
exports.getNotificationsQuery = (userId) => {
    return [
        { 
            $match: { 
                'receivers.user': Types.ObjectId(userId),
                // 'type': { $ne: 'message-sent' }
            } 
        },
        {
            $addFields: {
                receiver: {
                    $filter: {
                        input: '$receivers',
                        as: 'receiver',
                        cond: { $eq: ['$$receiver.user', Types.ObjectId(userId)] }
                    }
                }
            }   
        },
        { $unwind: '$receiver' },
        { $project: { receivers: 0 } }
    ];
}
