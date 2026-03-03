/**
 * User Controller
 * Uses Firestore (via Store Index).
 */

const { users, stats } = require('../store');

/**
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
    try {
        const user = await users.findById(req.user.id);

        const chatCount = await stats.chatCountByUser(req.user.id);
        const analysisCount = await stats.analysisCountByUser(req.user.id);

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
        await users.update(req.user.id, { isActive: false });

        res.status(200).json({
            success: true,
            message: 'Tu cuenta ha sido desactivada exitosamente.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, deactivateAccount };
