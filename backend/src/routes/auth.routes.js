/**
 * Auth Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 * PUT  /api/auth/update-profile
 * PUT  /api/auth/change-password
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Validation rules
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Por favor ingresa un email v\u00e1lido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contrase\u00f1a es requerida')
        .isLength({ min: 6 }).withMessage('La contrase\u00f1a debe tener al menos 6 caracteres'),
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .custom((value) => value.includes('@')).withMessage('El email debe contener @')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contrase\u00f1a es requerida')
        .isLength({ min: 6 }).withMessage('La contrase\u00f1a debe tener al menos 6 caracteres'),
];

// Validation middleware
const validate = (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array(),
        });
    }
    next();
};

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

