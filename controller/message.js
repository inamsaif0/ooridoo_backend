'use strict';

const { generateResponse, parseBody } = require('../utils');
const {
    createMessage,
    findMessageById,
    findMessages,
    getMessages, // without pagination
    unSeenMessageCountQuery,
    updateMessageById,
    deleteMessageById,

    
    unSeenMessageCountByChannelQuery
    

    
    
} = require('../models/message');
const { STATUS_CODE, NOTIFICATION_TYPE } = require('../utils/constants');
const {
    sendMessageIO,
    seenMessageIO,
    deleteMessageForAllIO,
    unSeenMessageCount,
    unSeenMessageCountChannel,
    chatUnReadCount,
    resetChatIO
} = require('../socket');

const { updateChat, createChat, findChats, findChat, removeChat } = require('../models/chat');
const { getChatListQuery } = require('../queries/message');
const { sendMessageValidation } = require('../validations/messageValidation');
const { Types } = require('mongoose');
const { createAndSendNotification,sendMessage } = require('../models/notification');
const { findUser } = require('../models/user');
const { ChatModel ,chatUnSeenCount} = require('../models/chat');
const { findBlockUser } = require('../models/block');
const path = require('path');
const { populate } = require('dotenv');

// create new message
exports.sendMessage = async (req, res, next) => {
    const { receiver, parent, text } = parseBody(req.body);
    const { error } = sendMessageValidation.validate(req.body);
    if (error) {
        return next({
            statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
            message: error.details[0].message
        });
    }
    const sender = req.user.id;
    let media = [];
    if (req.files?.media?.length > 0) {
        req.files?.media.forEach((file) => media.push(`messages/${file?.filename}`));
    }

    try {
        // check if user is blocked
        // const isBlocked = await findBlockUser({
        //     $or: [
        //         { blockId: sender, userId: receiver },
        //         { blockId: receiver, userId: sender }
        //     ],
        // });

        // if (isBlocked) return next({
        //     statusCode: STATUS_CODE.CONTENT_NOT_AVAILABLE,
        //     message: 'Blocked user'
        // });

        // find created channel or create new channel
        let isChannel = await findChat({
            $or: [{ channel: `${sender}-${receiver}` }, { channel: `${receiver}-${sender}` }]
        });




        if (isChannel) {
            if (isChannel.deletedBy) {
                await updateChat({ _id: isChannel?._id }, {
                    $unset: { deletedBy: isChannel.deletedBy }
                });
            }
        }
        let channel;
        if (!isChannel) {
            // create chat / new channel
            channel = `${sender}-${receiver}`;
            const chat = await createChat({
                users: [sender, receiver],
                channel
            });
        } else channel = isChannel?.channel;

        const messageData = { sender, channel, media ,receiver};
        if (parent) {
            messageData.parent = parent;
        }
        if (text) {
            messageData.text = text;
        }

        const message = await createMessage(messageData);

        // update last message in chat
        await updateChat({ channel }, { lastMessage: message._id });
        let resetChats = await ResetChatList(sender)
        let resetChatsReciever = await ResetChatList(receiver)

            resetChatIO( sender, resetChats)
            resetChatIO( receiver, resetChatsReciever)

        if (message) {
            const newMessage = await findMessageById(message._id)
                .populate({path: "sender", populate:{
                    path: "ssn_image profileImage"
                }})
                .populate('parent')


                const unSeenMessageCountByChannel = await unSeenMessageCountByChannelQuery(receiver,channel)
                
                const receiverCount =  await  unSeenMessageCountQuery(receiver)
                // const chatUnSeenCountvalue =  chatUnSeenCount(receiver)
                
                    // console.log('hehehehe', chatUnSeenCountvalue)
                


            console.log('msmsmsms',unSeenMessageCountByChannel)
                
                // console.log(receiverCount ,"receiverCount")


            // send message socket
            sendMessageIO(receiver, newMessage);

            unSeenMessageCount(receiver, receiverCount);

            unSeenMessageCountChannel(receiver,unSeenMessageCountByChannel,channel)
            // chatUnReadCount(receiver, chatUnSeenCountvalue)

            // send notification stuff here!
            const senderObject = await findUser({ _id: newMessage?.sender });
            const receiverIds = [receiver];
            const type = NOTIFICATION_TYPE.MESSAGE_SENT;
            console.log("this is channel",channel)
            await createAndSendNotification({ senderObject, receiverIds, type, relatedId:receiver, relatedType:"message" });
            return generateResponse(newMessage, "Message Send successfully", res);
        }
    } catch (error) {
        next(new Error(error.message));
    }
}

// get user messages (seen all messages)
exports.getMessages = async (req, res, next) => {
    const { user } = req.query;
    const loginUser = req.user.id;

    const query = {
        $or: [
            { channel: `${user}-${loginUser}` },
            { channel: `${loginUser}-${user}` }
        ],
        sender: user,
        isRead: false, // only update unread messages
        deletedBy: { $ne: loginUser }, // not show deleted message by me
        flaggedBy: { $ne: loginUser }
    }

    try {
        // check if user is blocked
        // const isBlocked = await findBlockUser({
        //     $or: [
        //         { blockId: user, userId: loginUser },
        //         { blockId: loginUser, userId: user }
        //     ],
        // });

        // update all messages to seen
        const messagesForSeen = await getMessages(query)
        if (messagesForSeen.length > 0) {
            for (const msg of messagesForSeen) {
                const message = await updateMessageById(msg._id, { $set: { isRead: true } });
                // seen message socket
                seenMessageIO(message);
                
                let resetChats = await ResetChatList(loginUser)
                let resetChatsReciever = await ResetChatList(user)
        
                    resetChatIO( loginUser, resetChats)
                    resetChatIO( user, resetChatsReciever)
        
            }
        }

        delete query.sender;
        delete query.isRead;

        const page = req.query.page || 1;
        const limit = req.query.limit || 10;

        let messagesData = await findMessages({ query, page, limit, populate: [
            {
              path: 'sender',
              populate: {
                path: 'ssn_image profileImage',
              },
            },
          ] });

        // if (messagesData?.result?.length === 0 || !messagesData) {
        //     console.log("No messages found");
        //     generateResponse(null, "No messages found", res);
        //     return;
        // }

        // convert docs to objects & adding key isBlocked (true/false)
        // const messages = messagesData?.result?.map((message) => {
        //     let newMessage = { ...message };
        //     newMessage.isBlocked = isBlocked ? true : false
        //     return newMessage;
        // });

        messagesData = {
            ...messagesData,
        }

        generateResponse(messagesData, "Messages fetched successfully", res);
    } catch (error) {
        next(new Error(error.message));
    }
}

// get chat list
const ResetChatList = async (userId) => {
  
    const page =  1;
    // const searchText = req.query.search_text || null;
    const limit =  100;

    const query = getChatListQuery(userId);
    // if (searchText) {
    //     query.push({
    //         $match: {
    //             "chat.fullName": {
    //                 $regex: searchText,
    //                 $options: "i" // Case-insensitive match
    //             }
    //         }
    //     });
    // }

    try {
        const chats = await findChats({ query, page, limit,   populate: [
            {
              path: 'sender',
              populate: {
                path: 'ssn_image profileImage',
              },
            },
          ]});
        // if (chats?.result?.length === 0 || !chats) {
        //     generateResponse(null, "No chats found", res);
        //     return;
        // }
          return chats
    } catch (error) {
        next(new Error(error.message));
    }
}
exports.getChatList = async (req, res, next) => {
    const userId = req.user.id;
    const page = req.query.page || 1;
    const searchText = req.query.search_text || null;
    const limit = req.query.limit || 10;

    const query = getChatListQuery(userId, searchText);
    if (searchText) {
        query.push({
            $match: {
                "chat.fullName": {
                    $regex: searchText,
                    $options: "i" // Case-insensitive match
                }
            }
        });
    }

    try {
        const chats = await findChats({ query, page, limit,   populate: [
            {
              path: 'sender',
              populate: {
                path: 'ssn_image profileImage',
              },
            },
          ]});
        // if (chats?.result?.length === 0 || !chats) {
        //     generateResponse(null, "No chats found", res);
        //     return;
        // }

        generateResponse(chats, "Chats fetched successfully", res);
    } catch (error) {
        next(new Error(error.message));
    }
}

// delete message
exports.deleteMessage = async (req, res, next) => {
    const userId = req.user.id;
    const { messageId } = req.params;

    try {
        let message = await findMessageById(messageId);

        // check if one user has already deleted message, then delete from db (delete for both)
        if (Types.ObjectId.isValid(message?.deletedBy) && message?.deletedBy.toString() !== userId) {

            const message = await deleteMessageById(messageId);
            if (!message) return next({
                statusCode: STATUS_CODE.NOT_FOUND,
                message: 'Message not found!'
            })

            generateResponse(message, "message deleted from DB!", res);
            return;
        }

        // delete message for one user
        message = await updateMessageById(messageId, { $set: { deletedBy: userId } });
        if (!message) return next({
            statusCode: STATUS_CODE.INTERNAL_SERVER_ERROR,
            message: 'Message deletion failed!'
        })

        generateResponse(message, "message deleted", res);
    } catch (error) {
        next(new Error(error.message));
    }
}

// deleted message for everyone (update message to deleteForEveryOne true)
exports.deleteMessageForEveryone = async (req, res, next) => {
    const userId = req.user.id;
    const { messageId } = req.params;

    try {
        let message = await findMessageById(messageId);
        if (!message) return next({
            statusCode: STATUS_CODE.NOT_FOUND,
            message: 'Message not found!'
        });

        // only sender can delete the message
        if (message?.sender.toString() !== userId) return next({
            statusCode: STATUS_CODE.UNAUTHORIZED,
            message: 'Message owner can only delete the message!'
        });

        // message owner update message
        message = await updateMessageById(messageId, { $set: { isDeletedForEveryone: true } });

        // socket
        deleteMessageForAllIO(message);
        generateResponse(message, "message deleted for everyone!", res);
    } catch (error) {
        next(new Error(error.message));
    }
}

// clear chat
exports.clearChat = async (req, res, next) => {
    const loginUser = req.user.id;
    const { user } = req.query;

    const query = {
        $or: [
            { channel: `${user}-${loginUser}` },
            { channel: `${loginUser}-${user}` }
        ]
    }

    try {
        const messages = await getMessages(query);
        if (messages?.length === 0) return next({
            statusCode: STATUS_CODE.NOT_FOUND,
            message: 'Messages not found!'
        });

        messages.forEach(async (msg) => {
            if (Types.ObjectId.isValid(msg?.deletedBy) && msg?.deletedBy.toString() !== loginUser) {
                // check if one user has already deleted message, then delete from db
                await deleteMessageById(msg?._id);
            } else {
                // if not deleted earlier from one side, then update deleteBy from loginUser
                await updateMessageById(msg?._id, { $set: { deletedBy: loginUser } });
            }
        })

        generateResponse(null, "clear chat", res);
    } catch (error) {
        next(new Error(error.message));
    }
}

// remove chat-box
exports.removeChat = async (req, res, next) => {
    const loginUser = req.user.id;
    const { user } = req.query;

    const query = {
        $or: [
            { channel: `${user}-${loginUser}` },
            { channel: `${loginUser}-${user}` }
        ]
    }

    try {
        const messages = await getMessages(query);
        if (messages?.length === 0) return next({
            statusCode: STATUS_CODE.NOT_FOUND,
            message: 'Messages not found!'
        });

        messages.forEach(async (msg) => {
            if (Types.ObjectId.isValid(msg?.deletedBy) && msg?.deletedBy.toString() !== loginUser) {
                // check if one user has already deleted message, then delete from db
                await deleteMessageById(msg?._id);
            } else {
                // if not deleted earlier from one side, then update deleteBy from loginUser
                await updateMessageById(msg?._id, { $set: { deletedBy: loginUser } });
            }
        })

        let chat = await findChat(query);
        // if chat-box is already deleted by other user then remove chat-box
        if (Types.ObjectId.isValid(chat?.deletedBy) && chat?.deletedBy.toString() !== loginUser) {
            // remove chat-box from db
            chat = await removeChat(chat?._id);
        } else {
            // update chat-box
            console.log(" update chat-box -- update chat-box")
            chat = await updateChat({ _id: chat?._id }, {
                $set: { deletedBy: loginUser }
            });
            console.log(chat, "chat--chat")
        }

        generateResponse(null, "clear chat", res);
    } catch (error) {
        next(new Error(error.message));
    }





}

// flag / report message
exports.flagMessage = async (req, res, next) => {
    const userId = req.user.id;
    const { messageId } = req.params;

    try {
        const message = await findMessageById(messageId);

        // check if sender is not me, then allow flag (as I am receiver)
        if (message?.sender.toString() !== userId) {
            const message = await updateMessageById(messageId, { $set: { flaggedBy: userId } });
            generateResponse(message, "message deleted from DB!", res);
        }
    } catch (error) {
        next(new Error(error.message));
    }
}

// get flag messages for Admin
exports.getFlagMessages = async (req, res, next) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const { q = '' } = req.body;

    const query = {
        $or: [{ text: { $regex: q, $options: 'i' } }],
        flaggedBy: { $ne: null }
    };
    const populate = { path: 'flaggedBy sender', select: 'email fullName image' };

    try {
        const messages = await findMessages({ query, page, limit, populate });
        generateResponse(messages, "Flag messages fetched successfully", res);
    } catch (error) {
        next(new Error(error.message));
    }
}
