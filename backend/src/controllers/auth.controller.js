/**
 * Auth Controller
 * Uses Firestore (via Store Index).
 */

const { users } = require('../store');
const { generateToken } = require('../middleware/auth.middleware');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor proporciona nombre, email y contraseña.',
            });
        }

        let user;
        try {
            user = await users.create({ name, email, password });
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

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor proporciona email y contraseña.',
            });
        }

        const user = await users.findByEmail(email);

        // Error if user not found OR password doesn't match
        if (!user || !users.verifyPassword(user, password)) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas. Por favor verifica tu email y contraseña.',
            });
        }

        // Update last login
        await users.update(user.id, { lastLogin: new Date().toISOString() });
        const updatedUser = await users.findById(user.id);

        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: `¡Bienvenido de nuevo, ${updatedUser.name}!`,
            data: {
                token,
                user: users.safe(updatedUser),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/google
 */
const googleLogin = async (req, res, next) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron credenciales de Google.',
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        let user = await users.findByEmail(email);

        if (!user) {
            // Auto-register via Google is standard, but we'll mark it as Google Account
            user = await users.create({
                name,
                email,
                avatar: picture,
                googleId,
                isGoogleAccount: true,
                password: null, // Google accounts don't need local password
            });
        } else {
            // Update last login and profile info
            await users.update(user.id, {
                lastLogin: new Date().toISOString(),
                avatar: picture || user.avatar,
                googleId: googleId || user.googleId,
            });
            user = await users.findById(user.id);
        }

        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: `¡Bienvenido, ${user.name}!`,
            data: {
                token,
                user: users.safe(user),
            },
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({
            success: false,
            message: 'Error de autenticación con Google.',
        });
    }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
    try {
        const user = await users.findById(req.user.id);

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

        const updated = await users.update(req.user.id, { name: name.trim() });

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

        const user = await users.findById(req.user.id);

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

        // The store's update method doesn't automatically hash, we should handle it here
        // or better, fix the store to handle password updates.
        // For now, let's use the helper from the store if possible or a direct hash.
        const crypto = require('crypto');
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
        const hashedPassword = `${salt}:${hash}`;

        await users.update(req.user.id, { password: hashedPassword });

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

module.exports = { register, login, getMe, updateProfile, changePassword, googleLogin };
