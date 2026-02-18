/**
 * Recommendation Routes
 * GET  /api/recommendations/specializations       - Get all specializations (public)
 * GET  /api/recommendations/specializations/:id   - Get one specialization (public)
 * GET  /api/recommendations/my-recommendation     - Get user's recommendation (private)
 * POST /api/recommendations/regenerate            - Regenerate recommendation (private)
 */

const express = require('express');
const router = express.Router();

const {
    getAllSpecializationsHandler,
    getSpecializationByIdHandler,
    getMyRecommendation,
    regenerateRecommendation,
} = require('../controllers/recommendation.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/specializations', getAllSpecializationsHandler);
router.get('/specializations/:id', getSpecializationByIdHandler);

// Private routes
router.get('/my-recommendation', protect, getMyRecommendation);
router.post('/regenerate', protect, regenerateRecommendation);

module.exports = router;
