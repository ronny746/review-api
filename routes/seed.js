const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const QrScan = require('../models/QRScan');

// Seed dummy data for 1 year
router.post('/seed-business-data', async (req, res) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ message: 'businessId is required' });
    }

    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    let reviewDocs = [];
    let qrScanDocs = [];

    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(oneYearAgo);
      monthDate.setMonth(monthDate.getMonth() + month);

      // Random review count for month
      const reviewCount = Math.floor(Math.random() * 20) + 5; // 5-25 reviews
      for (let i = 0; i < reviewCount; i++) {
        reviewDocs.push({
          businessId,
          name: `User ${i + 1} M${month + 1}`,
          mobile: `99999999${i}`,
          comment: `Review comment ${i + 1} for month ${month + 1}`,
          location: `City ${month + 1}`,
          rating: Math.floor(Math.random() * 5) + 1,
          createdAt: new Date(monthDate.getTime() + Math.random() * 2629800000) // random day in month
        });
      }

      // Random QR scan count for month
      const qrCount = Math.floor(Math.random() * 50) + 10; // 10-60 scans
      for (let i = 0; i < qrCount; i++) {
        qrScanDocs.push({
          businessId,
          scannedAt: new Date(monthDate.getTime() + Math.random() * 2629800000)
        });
      }
    }

    await Review.insertMany(reviewDocs);
    await QrScan.insertMany(qrScanDocs);

    res.json({
      message: 'Dummy data inserted successfully',
      reviewsInserted: reviewDocs.length,
      qrScansInserted: qrScanDocs.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
