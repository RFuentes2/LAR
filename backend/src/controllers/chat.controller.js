/**
 * Chat Controller
 * Uses in-memory store (no DB). TODO: migrate to PostgreSQL.
 */

const { chats, analyses } = require('../store/memoryStore');
const { generateChatResponse } = require('../services/openai.service');

/**
 * GET /api/chat
 */
const getUserChats = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const { items, total } = chats.findByUserId(req.user.id, { page, limit });

        res.status(200).json({
            success: true,
            data: {
                chats: items,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/chat
 */
const createChat = async (req, res, next) => {
    try {
        const { title, cvAnalysisId } = req.body;

        const chat = chats.create({
            userId: req.user.id,
            title: title || 'Nueva conversación',
            cvAnalysisId: cvAnalysisId || null,
        });

        res.status(201).json({
            success: true,
            message: 'Chat creado exitosamente.',
            data: { chat },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/chat/:chatId
 */
const getChatById = async (req, res, next) => {
    try {
        const chat = chats.findByIdAndUser(req.params.chatId, req.user.id);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat no encontrado.',
            });
        }

        res.status(200).json({
            success: true,
            data: { chat },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/chat/:chatId/message
 */
const sendMessage = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { content, cvAnalysisId } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El mensaje no puede estar vacío.',
            });
        }

        const chat = chats.findByIdAndUser(chatId, req.user.id);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat no encontrado.',
            });
        }

        // Resolve CV analysis context
        let userProfile = null;
        let recommendation = null;
        const analysisId = cvAnalysisId || chat.cvAnalysisId;

        if (analysisId) {
            const analysis = analyses.findById(analysisId);
            if (analysis && analysis.status === 'completed') {
                userProfile = analysis.extractedProfile;
                recommendation = analysis.recommendation;
            }
        }

        // Add user message
        const userMsg = chats.addMessage(chatId, {
            role: 'user',
            content: content.trim(),
            metadata: { type: 'text' },
        });

        // Auto-title from first message
        const freshChat = chats.findById(chatId);
        if (!freshChat.titleGenerated && freshChat.messages.length === 1) {
            chats.update(chatId, {
                title: content.substring(0, 60) + (content.length > 60 ? '...' : ''),
                titleGenerated: true,
            });
        }

        // Update cvAnalysisId on chat if provided
        if (cvAnalysisId && !freshChat.cvAnalysisId) {
            chats.update(chatId, { cvAnalysisId });
        }

        // Build recent message history for OpenAI (last 20)
        const recentMessages = freshChat.messages.slice(-20).map((m) => ({
            role: m.role,
            content: m.content,
        }));
        // Include the new user message
        recentMessages.push({ role: 'user', content: content.trim() });

        // Generate AI response
        const aiContent = await generateChatResponse(recentMessages, userProfile, recommendation);

        // Add assistant message
        const assistantMsg = chats.addMessage(chatId, {
            role: 'assistant',
            content: aiContent,
            metadata: { type: 'text' },
        });

        res.status(200).json({
            success: true,
            data: {
                userMessage: userMsg,
                assistantMessage: assistantMsg,
                chatId,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/chat/:chatId
 */
const deleteChat = async (req, res, next) => {
    try {
        const deleted = chats.softDelete(req.params.chatId, req.user.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Chat no encontrado.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chat eliminado exitosamente.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/chat/:chatId/title
 */
const updateChatTitle = async (req, res, next) => {
    try {
        const { title } = req.body;

        const chat = chats.findByIdAndUser(req.params.chatId, req.user.id);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat no encontrado.',
            });
        }

        const updated = chats.update(req.params.chatId, { title });

        res.status(200).json({
            success: true,
            data: { chat: updated },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserChats,
    createChat,
    getChatById,
    sendMessage,
    deleteChat,
    updateChatTitle,
};
