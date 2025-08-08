const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/add', reviewController.addReview); // open to public, no auth

router.get('/business', authMiddleware, reviewController.getReviewsByBusiness);
router.get('/business/stats', authMiddleware, reviewController.getReviewStats);
router.get('/business/daily-growth', authMiddleware, reviewController.getDailyGrowthWithStats);


module.exports = router;
