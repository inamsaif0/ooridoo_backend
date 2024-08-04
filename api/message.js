'use strict';

const { Router } = require('express');
const {
    getChatList,
    sendMessage,
    getMessages,
    deleteMessage,
    deleteMessageForEveryone,
    clearChat,
    removeChat,
    flagMessage,
    getFlagMessages,
    // deleteMessage
    
} = require('../controller/message');
const { upload } = require('../utils');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const { deleteNotification }  = require('../models/notification')
class MessageAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes () {
        const router = this.router;

        router.get('/chat-list', authMiddleware(Object.values(ROLES)), getChatList);
        router.get('/', authMiddleware(Object.values(ROLES)), getMessages);
        router.post('/send', authMiddleware(Object.values(ROLES)), upload('messages').fields([{ name: 'media', maxCount: 500 }]), sendMessage);
        router.post('/delete/:messageId', authMiddleware(Object.values(ROLES)), deleteMessage);
        router.post('/delete-for-all/:messageId', authMiddleware(Object.values(ROLES)), deleteMessageForEveryone);
        router.post('/clear-chat', authMiddleware(Object.values(ROLES)), clearChat);
        router.post('/remove-chat', authMiddleware(Object.values(ROLES)), removeChat);
        router.post('/flag/:messageId', authMiddleware(Object.values(ROLES)), flagMessage);

        // Flag messages - Admin API
        router.post('/flag', authMiddleware([ROLES.ADMIN]), getFlagMessages);
    }

    getRouter () {
        return this.router;
    }

    getRouterGroup () {
        return '/message';
    }
}

module.exports = MessageAPI;