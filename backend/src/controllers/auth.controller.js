/**
 * Auth Controller
 * Uses in-memory store (no DB). TODO: migrate to PostgreSQL.
 */

const { users } = require('../store/memoryStore');
const { generateToken } = require('../middleware/auth.middleware');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        let user;
        try {
            user = users.create({ name, email, password });
        } catch (err) {
            if (err.message === 'DUPLICATE_EMAIL') {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe una cuenta con ese email. Por favor inicia sesión.',
                });
            }
            throw err;
        }

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: '¡Cuenta creada exitosamente! Bienvenido a LAR University.',
            data: {
                token,
                user: users.safe(user),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = users.findByEmail(email);

        if (!user || !users.verifyPassword(user, password)) {
            return res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos.',
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Tu cuenta ha sido desactivada. Contacta al soporte.',
            });
        }

        users.update(user.id, { lastLogin: new Date().toISOString() });

        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: `¡Bienvenido de vuelta, ${user.name}!`,
            data: {
                token,
                user: users.safe(user),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
    try {
        const user = users.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: { user: users.safe(user) },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/auth/update-profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'El nombre debe tener al menos 2 caracteres.',
            });
        }

        const updated = users.update(req.user.id, { name: name.trim() });

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente.',
            data: { user: users.safe(updated) },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = users.findById(req.user.id);

        if (!users.verifyPassword(user, currentPassword)) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña actual es incorrecta.',
            });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres.',
            });
        }

        // Re-hash new password via store
        const crypto = require('crypto');
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
        users.update(req.user.id, { password: `${salt}:${hash}` });

        const token = generateToken(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente.',
            data: { token },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
