'use strict';

const _ = require('lodash');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FCM = require('fcm-node');
const { STATUS_CODE, COMPETITION_STATUS, COMPETITION_STYLE, PAYMENT_STATUS, NOTIFICATION_TYPE } = require('./constants');
const express = require('express');
// const admin = require('firebase-admin');
// const serviceAccount = require('./rentersite-app-4562bd47508d.json');
const { findRents, allrent, updateMyRents } = require("../models/rent")
// const { req, res} = require("express")
// const { insertManyTransactions } = require('../models/transaction');
// const { notificationUpdate }  =  require('../socket')
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });

exports.generateResponse = (data, message, res) => {
    console.log('hello',data?.data);
    if(data?.data){
        return res.status(STATUS_CODE.OK).send({
            status:true,
            data:data?.data,
            message,
        });
    }
    return res.status(STATUS_CODE.OK).send({
        status:true,
        data,
        message,
    });
}


exports.parseBody = (body) => {
    let obj;
    console.log(body)
    if (typeof body === "object") obj = body;
    else obj = JSON.parse(body);
    return obj;
}

exports.generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

const generateFilename = (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '.' + file.originalname.split('.').pop());
};

exports.upload = (folderName) => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                const path = `uploads/${folderName}/`;
                fs.mkdirSync(path, { recursive: true })
                cb(null, path);
            },
            filename: generateFilename
        }),
        
        limits: { fileSize: 100 * 1024 * 1024 },  // max 100MB
        fileFilter: function (req, file, cb) {
            if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('pdf/')) {
                return cb(null, true);
            }
            console.log("this is point 2")

            req.fileValidationError = 'Only image / video files are allowed!';
            return cb(null, false);

        }

    })
}

const Storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.join("public", "uploads"));
    },
    filename: (req, file, callback) => {
      const fileName = file.originalname.split(" ").join("-");
      const extension = path.extname(fileName);
      const baseName = path.basename(fileName, extension);
      callback(null, baseName + "-" + Date.now() + extension);
    },
  });

exports.handleMultipartData = multer({
    storage: Storage,
    limits: {
      fileSize: 1024 * 1024 * 10,
    },
    fileFilter: (req, file, callback) => {
      const FileTypes = /jpeg|jpg|png|gif|avif/;
      const mimType = FileTypes.test(file.mimetype);
      const extname = FileTypes.test(path.extname(file.originalname));
      if (mimType && extname) {
        return callback(null, true);
      }
      return callback(new Error("File type not supported"), false);
    },
  });
  
exports.uploads = (folderName) => { 
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                const path = `uploads/${folderName}/`;
                fs.mkdirSync(path, { recursive: true });
                cb(null, path);
            },
            filename: generateFilename
        }),
        fileFilter: function (req, file, cb) {
            if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
                return cb(null, true);
            }

            req.fileValidationError = 'Only image / video files are allowed!';
            return cb(null, false);
        }
    });
};

// exports.sendNotification = ({ title, body, fcmToken }) => {
//     const serverKey = process.env.FIREBASE_SERVER_KEY;
//     const fcm = new FCM(serverKey);

//     const message = {
//         to: fcmToken,
//         notification: { title, body }
//     };

//     fcm.send(message, function (err, response) {
//         if (err) {
//             console.log("FCM - Something has gone wrong!");
//         } else {
//             console.log("Successfully sent with response: ", response);
//         }
//     });
// }

// exports.commentsWithNestedComments = (allComments) => {
//     const commentMap = {};
//     const result = [];

//     // First create a map of all comments based on their _id
//     allComments.forEach(comment => {
//         comment.children = [];
//         commentMap[comment._id.toString()] = comment;
//     });

//     // Loop through all comments and add any child comments to their parent's children array
//     allComments.forEach(comment => {
//         if (comment.parentId) {
//             const parentComment = commentMap[comment.parentId.toString()];
//             if (parentComment) {
//                 parentComment.children.push(comment);
//             }
//         } else {
//             // If a comment has no parentId, it is a top-level comment and should be added to the result array
//             result.push(comment);
//         }
//     });

//     return result;
// }

// // competition is an object of competition model
// // exports.userAddToCompetitionValidation = (competition, userId) => {
// //     // check if user is already in competition


// //     const isUserInCompetition = competition?.participantIds.includes(userId);
// //     if (isUserInCompetition) {
// //         return { isValid: false, message: "You are already in this competition" };
// //     }

// //     // check if competition is full
// //     if (competition.participantIds.length >= competition.maxParticipants) {
// //         return { isValid: false, message: "Competition is full" };
// //     }

// //     // check if competition is expired
// //     if (competition.status != 'Started') {
// //         return { isValid: false, message: "Competition is Upcoming / Completed" };
// //     }

// //     return { isValid: true, message: "User can join competition" };
// // }

// // check if user is already in competition
// exports.isUserInCompetition = (competition, userId) => {
//     return competition?.participantIds.includes(userId);
// }

// // check if competition is full
// exports.isCompetitionParticipantsFull = (competition) => {
//     return competition.participantIds.length >= competition.maxParticipants;
// }

// // check if competition is expired
// exports.isCompetitionExpired = (competition) => {
//     return competition.status != 'Started';
//     // return competition.endTime < new Date();
// }

// // check if user can post in competition
// exports.isUserPostInCompetitionValidation = (competition, userId) => {
//     // is competition expired
//     if (competition.status != 'Started') {
//         return { isValid: false, message: "Competition is Upcoming / Completed" };
//     }

//     // is user not in competition
//     if (!this.isUserInCompetition(competition, userId)) {
//         return { isValid: false, message: "You are not in this competition" };
//     }

//     // count user post in competition
//     const userPostsCount = competition.postIds.filter(post => post.userId.toString() == userId).length;
//     console.log("userPostsCount", userPostsCount);

//     // check if user post limit is reached
//     if (userPostsCount >= competition.maxPostsPerUser) {
//         return { isValid: false, message: "You have reached max post limit" };
//     }

//     return { isValid: true, message: "User Can Post" };
// }

// // check if user can vote on post
// exports.addVoteOnPostValidation = (competition, userId) => {
//     // is competition expired
//     if (competition.status != COMPETITION_STATUS.STARTED) {
//         return { isValid: false, message: "Competition is not running." };
//     }

//     // is user not in competition
//     if (this.isUserInCompetition(competition, userId)) {
//         return { isValid: false, message: "You are already Artist in this Competition" };
//     }

//     return { isValid: true, message: "User Can Vote" };
// }

// exports.addCommentValidation = (competition) => {
//     // is competition expired
//     if (competition.status != 'Started') {
//         return { isValid: false, message: "Competition is Upcoming / Completed" };
//     }

//     return { isValid: true, message: "User Can Vote" };
// }

// pagination with mongoose paginate library
exports.getMongoosePaginatedData = async ({
    model, page = 1, limit = 10, query = {}, populate = '', select = '-password', sort = { createdAt: 1 },
}) => {
    const options = {
        select,
        sort,
        populate,
        lean: true,
        page,
        limit,
        customLabels: {
            totalDocs: 'totalItems',
            docs: 'data',
            page: 'currentPage',
            meta: 'pagination',
        },
    };

    const { data, pagination } = await model.paginate(query, options);
    // // Remove __v key from each document in the data array
    // data.forEach(doc => {
    //     delete doc.__v;
    //     delete doc.id;
    //     return doc;
    // });

    delete pagination.limit;
    delete pagination.pagingCounter;

    return { data, pagination };
}

// aggregate pagination with mongoose paginate library
exports.getMongooseAggregatePaginatedData = async ({
    model, page = 1, limit = 10, query = [], populate = '', select = '-password', sort = { createdAt: -1 },
}) => {
    const options = {
        select,
        sort,
        lean: true,
        page,
        populate,
        limit,
        customLabels: {
            totalDocs: 'totalItems',
            docs: 'data',
            page: 'currentPage',
            meta: 'pagination',
        },
    };

    const myAggregate = model.aggregate(query);
    const { data, pagination } = await model.aggregatePaginate(myAggregate, options);
    // // Remove __v key from each document in the data array
    // data.forEach(doc => {
    //     delete doc.__v;
    //     delete doc.id;
    //     return doc;
    // });

    delete pagination.limit;
    delete pagination.pagingCounter;

    return { data, pagination };
}


// get random participants from array
exports.getRandomParticipants = (participants, number) => {
    // Shuffle the participants array
    const shuffledIds = participants.sort(() => Math.random() - 0.5);

    // Return the first `number` elements from the shuffled array
    return shuffledIds.slice(0, number);
}

// Jackpot Competition Completion Validation
// exports.completeJackpotValidation = (competition, noOfWinners) => {
//     // check if competition is not started
//     if (competition?.status != COMPETITION_STATUS.STARTED) {
//         return { isValid: false, message: "Competition is not started" };
//     }

//     // check if competition is jackpot or not
//     if (competition?.competitionStyle != COMPETITION_STYLE.JACKPOT_PLAY) {
//         return { isValid: false, message: "Competition is not Jackpot" };
//     }

//     // check if noOfWinners is not valid or more than participants
//     if (noOfWinners > competition?.participantIds.length) {
//         return { isValid: false, message: "No of winners is more than participants" };
//     }

//     return { isValid: true, message: "Competition can be completed" };
// }


exports.sendNotificationToAll = ({title, body ,tokens, notification}) => {
    console.log('this is notification',notification)
    // const message = {
        const message = {
            data: {
                title: title,
                relatedId: notification.relatedId,
                relatedType: notification.relatedType,
                title: notification.title,
                body
            },
            notification: {
                title,
                // body: "hello word",
                body
            },
            tokens,
          };

    console.log("message", message);
  
    if (tokens.length > 0) {
      return admin.messaging()
        .sendMulticast(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
          return response;
        })
        .catch((error) => {
          console.log('Error sending message:', error.responses);
          throw error;
        });
    } else {
      throw new Error('No tokens provided');
    }
  }
// send notification to all
// exports.sendNotificationToAll = ({ title, body, fcmTokens , notification}) => {
//     const serverKey = process.env.FIREBASE_SERVER_KEY;
//     console.log('serverKey', serverKey);

//     const fcm = new FCM(serverKey);

//     const message = {

//         registration_ids: [...fcmTokens],
//         notification: {
//             title,
//             body,
         
//         },
//         data: notification,
//         priority: 'high',
//     };
 
//     fcm.send(message, function (err, response) {
//         if (err) {
//             console.log(err ,"FCM - Something has gone wrong!");
//         } else {
//             console.log("Successfully sent with response: ", response);
//         }
//     });
//     // notificationUpdate(message);
// }

// complete competitive competition validation
// exports.completeCompetitiveValidation = (competition) => {
//     // check if competition is not started
//     if (competition?.status != COMPETITION_STATUS.STARTED) {
//         return { isValid: false, message: "Competition is not started" };
//     }

//     // check if competition is not jackpot
//     if (competition?.competitionStyle != COMPETITION_STYLE.COMPETITIVE_PLAY) {
//         return { isValid: false, message: "Competition is not Competitive Play." };
//     }

//     // check if noOfWinners is not valid or more than participants
//     if (competition?.participantIds.length === 0) {
//         return { isValid: false, message: "No participant in this competition." };
//     }

//     return { isValid: true, message: "Competition can be completed" };
// }

// exports.rentalUpdateByMinutes = (rentID, IncomingData, outgoingDate) => {

//     // created date < current date (end rent)
//     let 
//     // created date == current date (start rent)
    
//     // steps

//     // get the rent where created at is lesser than current date and status is started
//     // get the rent where created at is equal to current date and status is pending

//     // change the first status to completed
//     // change the second status to started



    
// }

let storedUserId = null;

exports.storeUserId = (req, res, next) => {
    storedUserId = req.user.id;
    next();
};

exports.rentalUpdateByMinutes = async () => {
    const currentDate = new Date();
    console.log('this is current data>>>>>>>', currentDate)
    try {
        // Find the rents where createdAt is less than the current date and status is started
        const startedRents = await allrent({
            endingDate: { $lte: currentDate },
            status: 'started'
        });
        console.log('this is startedRents data>>>>>>>', startedRents)
        
        // Find the rents where createdAt is equal to the current date and status is pending
        const pendingRents = await allrent({
            startingDate: { $eq: currentDate },
            status: 'not-started'
        });
        console.log('this is pendingRents data>>>>>>>', pendingRents)

        // Change the status of the first set to completed
        await updateMyRents(
            { _id: { $in: startedRents.map(rent => rent._id) } },
            { $set: { status: 'completed' } }
        );
        
        // Change the status of the second set to started
        await updateMyRents(
            { _id: { $in: pendingRents.map(rent => rent._id) } },
            { $set: { status: 'not-completed' } }
        );
        
        console.log('Rent statuses updated successfully.');
    } catch (error) {
        console.error('Error updating rent statuses:', error);
    }
};
