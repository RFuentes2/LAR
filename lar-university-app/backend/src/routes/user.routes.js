/**
 * User Routes
 * GET    /api/users/profile    - Get user profile with stats
 * DELETE /api/users/account    - Deactivate account
 */

const express = require('express');
const router = express.Router();

const { getProfile, deactivateAccount } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/profile', getProfile);
router.delete('/account', deactivateAccount);

module.exports = router;
