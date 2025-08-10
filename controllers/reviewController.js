const Review = require('../models/Review');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../utils/response');

exports.addReview = async (req, res) => {
  try {
    const { businessId, name, mobile, comment, location, rating } = req.body;

    if (!businessId || !rating) {
      return sendError(res, 'Business and rating are required', null, 400);
    }

    const review = new Review({ businessId, name, mobile, comment, location, rating });
    await review.save();

    sendSuccess(res, 'Review added successfully', review, 201);
  } catch (error) {
    sendError(res, 'Error adding review', error.message, 500);
  }
};

exports.getReviewsByBusiness = async (req, res) => {
  try {
    const businessId = req.userId;
    const reviews = await Review.find({ businessId });

    sendSuccess(res, 'Reviews fetched successfully', reviews, 200);
  } catch (error) {
    sendError(res, 'Error fetching reviews', error.message, 500);
  }
};

exports.getReviewStats = async (req, res) => {
  try {
    const businessId = req.userId;
    const totalReviews = await Review.countDocuments({ businessId });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Review.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    sendSuccess(res, 'Review stats fetched successfully', { totalReviews, monthlyStats }, 200);
  } catch (error) {
    sendError(res, 'Error fetching review stats', error.message, 500);
  }
};

exports.getDailyGrowthWithStats = async (req, res) => {
  try {
    const businessId = req.userId;
    const daysBack = 30;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - daysBack);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyData = await Review.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          createdAt: { $gte: startDate, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Kolkata"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const result = [];
    let totalReviews = 0;
    let prevCount = 0;
    let growthSum = 0;
    let growthDays = 0;
    let maxReviews = -Infinity;
    let minReviews = Infinity;
    let bestDay = null;
    let worstDay = null;

    for (let i = 0; i <= daysBack; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().slice(0, 10);

      const dayRecord = dailyData.find(d => d._id === dateString);
      const count = dayRecord ? dayRecord.count : 0;

      let growth = null;
      if (i > 0) {
        if (prevCount === 0 && count > 0) growth = 100;
        else if (prevCount === 0 && count === 0) growth = 0;
        else growth = ((count - prevCount) / prevCount) * 100;
      }

      if (count > maxReviews) {
        maxReviews = count;
        bestDay = dateString;
      }
      if (count < minReviews) {
        minReviews = count;
        worstDay = dateString;
      }

      if (growth !== null) {
        growthSum += growth;
        growthDays++;
      }

      totalReviews += count;
      prevCount = count;

      result.push({
        date: dateString,
        count,
        growthPercent: growth !== null ? Number(growth.toFixed(2)) : null
      });
    }

    const averageGrowthPercent = growthDays > 0 ? Number((growthSum / growthDays).toFixed(2)) : 0;

    sendSuccess(res, 'Daily growth stats fetched successfully', {
      summary: {
        totalReviews,
        averageDailyGrowthPercent: averageGrowthPercent,
        bestDay: { date: bestDay, reviews: maxReviews },
        worstDay: { date: worstDay, reviews: minReviews }
      },
      dailyData: result
    }, 200);
  } catch (error) {
    sendError(res, 'Error fetching daily growth stats', error.message, 500);
  }
};
