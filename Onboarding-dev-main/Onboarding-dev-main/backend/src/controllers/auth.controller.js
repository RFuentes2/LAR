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
                    message: 'Ya existe una cuenta con ese email. Por favor inicia sesi\u00f3n.',
                });
            }
            throw err;
        }

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: '\u00a1Cuenta creada exitosamente! Bienvenido a LAR University.',
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

        // Temporary login for deployment/demo:
        // allow access with minimal format validation only.
        let user = users.findByEmail(email);
        if (!user) {
            const fallbackName = email.split('@')[0] || 'Usuario';
            user = users.create({
                name: fallbackName,
                email,
                password,
            });
        } else {
            users.update(user.id, { lastLogin: new Date().toISOString() });
            user = users.findById(user.id);
        }

        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: `Bienvenido, ${user.name}!`,
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
                message: 'La contrase\u00f1a actual es incorrecta.',
            });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contrase\u00f1a debe tener al menos 6 caracteres.',
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
            message: 'Contrase\u00f1a actualizada exitosamente.',
            data: { token },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, updateProfile, changePassword };

