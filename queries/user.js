const { Types } = require("mongoose");

// search users by name, email, mobile (aggregate) without current user and admin
exports.searchUsersQuery = (userId, q = '') => {
    return [
        {
            $match: {
                $and: [
                    { _id: { $ne: Types.ObjectId(userId) } },
                    { role: { $ne: 'admin' } },
                    {
                        $or: [
                            { fullName: { $regex: q, $options: 'i' } },
                            { email: { $regex: q, $options: 'i' } },
                            { mobile: { $regex: q, $options: 'i' } },
                            { country: { $regex: q, $options: 'i' } },
                            { city: { $regex: q, $options: 'i' } },
                        ]
                    }
                ]
            },
            
        },

        { $project: {  password: 0, __v:0 } },
    ];
}
exports.searchUsersQuery = (userId, q = '') => {
    return [
        {
            $match: {
                $and: [
                    { _id: { $ne: Types.ObjectId(userId) } },
                    { role: { $ne: 'admin' } },
                    {
                        $or: [
                            { fullName: { $regex: q, $options: 'i' } },
                            { email: { $regex: q, $options: 'i' } },
                            { mobile: { $regex: q, $options: 'i' } },
                            { country: { $regex: q, $options: 'i' } },
                            { city: { $regex: q, $options: 'i' } },
                        ]
                    }
                ]
            },
            
        },

        { $project: {  password: 0, __v:0 } },
    ];
}

// get all users with pagination (aggregate) without users who blocked me
exports.getUsersExceptBlockedQuery = (userId, q = '') => {
    return [
        {
            $match: {
                $and: [
                    { _id: { $ne: Types.ObjectId(userId) } },
                    { role: { $ne: 'admin' } },
                    {
                        $or: [
                            { fullName: { $regex: q, $options: 'i' } },
                            { email: { $regex: q, $options: 'i' } },
                            { mobile: { $regex: q, $options: 'i' } },
                            { country: { $regex: q, $options: 'i' } },
                            { city: { $regex: q, $options: 'i' } },
                        ]
                    }
                ]
            },
        },
        {
            $lookup: {
                from: 'blocks',
                let: { userId: Types.ObjectId(userId), targetId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$userId', '$$targetId'] },
                                    { $eq: ['$blockId', '$$userId'] },
                                ]
                            }
                        }
                    }
                ],
                as: 'blocked'
            }
        },
        { $match: { blocked: { $size: 0 } } }, // exclude users who have blocked the current user
        {
            $lookup: {
                from: 'followings',
                let: { userId: Types.ObjectId(userId), targetId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$userId', '$$userId'] },
                                    { $eq: ['$followingId', '$$targetId'] },
                                ],
                            },
                        },
                    },
                ],
                as: 'following',
            },
        },
        {
            $lookup: {
                from: 'followings',
                let: { userId: Types.ObjectId(userId), targetId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$userId', '$$targetId'] },
                                    { $eq: ['$followingId', '$$userId'] },
                                ],
                            },
                        },
                    },
                ],
                as: 'follower',
            },
        },
        {
            $addFields: {
                isFollower: { $cond: [{ $gt: [{ $size: '$follower' }, 0] }, true, false] },
                isFollowing: { $cond: [{ $gt: [{ $size: '$following' }, 0] }, true, false] },
            },
        },
        { $project: { follower: 0, following: 0, blocked: 0, password: 0, __v: 0, } },
    ];
}

// get user data
exports.getUserDataQuery = (userId, loginUserId) => {
    return [
        { $match: { _id: Types.ObjectId(userId) } },
        { $lookup: { from: 'followings', localField: '_id', foreignField: 'userId', as: 'following' } },
        { $lookup: { from: 'followings', localField: '_id', foreignField: 'followingId', as: 'follower' } },
        // // get sum of upVotes from post collection by userId
        {
            $lookup: {
                from: 'posts',
                let: { userId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$userId', '$$userId'] } } }, // $userId is from post collection and $$userId is from user collection
                    { $group: { _id: null, upVotes: { $sum: '$upVotes' } } }
                ],
                as: 'upVotes'
            }
        },
        {
            $lookup: {
                from: 'followings',
                // 
                let: { userId: Types.ObjectId(loginUserId), followingId: Types.ObjectId(userId) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$userId', '$$userId'] },
                                    { $eq: ['$followingId', '$$followingId'] },
                                ],
                            },
                        },
                    },
                ],
                as: 'isFollowing',
            },
        },
        {
            $addFields: {
                competitionCount: { $size: '$competitionIds' },
                // upVotesCount: { $arrayElemAt: ['$upVotes.upVotes', 0] },
                upVotesCount: { $ifNull: [{ $arrayElemAt: ['$upVotes.upVotes', 0] }, 0] },
                followingCount: { $size: '$following' },
                followerCount: { $size: '$follower' },
                isFollowing: { $cond: [{ $gt: [{ $size: '$isFollowing' }, 0] }, true, false] },
            }
        },
        // exclude unnecessary fields
        { $project: { following: 0, follower: 0, password: 0, __v: 0, upVotes: 0 } },
    ];
}