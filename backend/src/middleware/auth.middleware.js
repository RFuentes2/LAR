/**
 * Authentication Middleware
 * JWT token verification using in-memory store.
 * TODO: migrate to PostgreSQL.
 */

const jwt = require('jsonwebtoken');
const { users } = require('../store/memoryStore');

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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

module.exports = { protect, restrictTo, generateToken };
