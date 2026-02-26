/**
 * User Controller
 * Uses in-memory store (no DB). TODO: migrate to PostgreSQL.
 */

const { users, stats } = require('../store/memoryStore');

/**
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
    try {
        const user = users.findById(req.user.id);

        const chatCount = stats.chatCountByUser(req.user.id);
        const analysisCount = stats.analysisCountByUser(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                user: users.safe(user),
                stats: { chatCount, analysisCount },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/users/account
 */
const deactivateAccount = async (req, res, next) => {
    try {
        users.update(req.user.id, { isActive: false });

        res.status(200).json({
            success: true,
            message: 'Tu cuenta ha sido desactivada exitosamente.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, deactivateAccount };
