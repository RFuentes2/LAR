/**
 * Authentication Middleware
 * JWT token verification using in-memory store.
 * TODO: migrate to PostgreSQL.
 */

const jwt = require('jsonwebtoken');
const { users } = require('../store/memoryStore');
const FALLBACK_JWT_SECRET = 'dev-only-fallback-secret-change-in-prod';
let warnedAboutFallbackSecret = false;

const getJwtSecret = () => {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) {
        return process.env.JWT_SECRET;
    }

    if (!warnedAboutFallbackSecret) {
        warnedAboutFallbackSecret = true;
        console.warn('JWT_SECRET is not set. Using insecure fallback secret. Set JWT_SECRET in Cloud Run.');
    }

    return FALLBACK_JWT_SECRET;
};

/**
 * Protect routes - verify JWT token
 */
const protect = (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado. Por favor inicia sesión.',
            });
        }

        const decoded = jwt.verify(token, getJwtSecret());

        const user = users.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'El usuario ya no existe.',
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Tu cuenta ha sido desactivada.',
            });
        }

        // Attach safe user (no password) to request
        req.user = users.safe(user);
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido.',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            });
        }
        next(error);
    }
};

/**
 * Restrict to specific roles
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción.',
            });
        }
        next();
    };
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, getJwtSecret(), {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

module.exports = { protect, restrictTo, generateToken };
