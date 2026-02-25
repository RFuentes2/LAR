/**
 * Chat Routes
 * GET    /api/chat                    - Get all user chats
 * POST   /api/chat                    - Create new chat
 * GET    /api/chat/:chatId            - Get specific chat
 * POST   /api/chat/:chatId/message    - Send message
 * DELETE /api/chat/:chatId            - Delete chat
 * PUT    /api/chat/:chatId/title      - Update chat title
 */

const express = require('express');
const router = express.Router();

const {
    getUserChats,
    createChat,
    getChatById,
    sendMessage,
    deleteChat,
    updateChatTitle,
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// All chat routes require authentication
router.use(protect);

router.get('/', getUserChats);
router.post('/', createChat);
router.get('/:chatId', getChatById);
router.post('/:chatId/message', sendMessage);
router.delete('/:chatId', deleteChat);
router.put('/:chatId/title', updateChatTitle);

module.exports = router;
