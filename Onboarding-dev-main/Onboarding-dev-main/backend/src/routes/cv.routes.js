/**
 * CV Routes
 * POST /api/cv/upload        - Upload and analyze PDF CV
 * POST /api/cv/linkedin      - Analyze LinkedIn profile
 * GET  /api/cv/my-analysis   - Get latest CV analysis
 * GET  /api/cv/history       - Get all CV analyses
 */

const express = require('express');
const router = express.Router();

const { uploadCV, analyzeLinkedIn, getMyAnalysis, getAnalysisHistory } = require('../controllers/cv.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

// All CV routes require authentication
router.use(protect);

// Upload PDF CV
router.post(
    '/upload',
    upload.single('cv'),
    handleUploadError,
    uploadCV
);

// Analyze LinkedIn
router.post('/linkedin', analyzeLinkedIn);

// Get analyses
router.get('/my-analysis', getMyAnalysis);
router.get('/history', getAnalysisHistory);

module.exports = router;
