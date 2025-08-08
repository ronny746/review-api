const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const referralController = require('../controllers/referralController');

router.get('/stats', authMiddleware, referralController.getReferralStats);

module.exports = router;
