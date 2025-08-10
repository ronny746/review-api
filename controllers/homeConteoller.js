// controllers/homeController.js
const mongoose = require("mongoose");
const Review = require("../models/Review");
const QRScan = require("../models/QRScan");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

exports.getHomeData = async (req, res) => {
  try {
    const businessId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return sendError(res, "Invalid business ID", null, 400);
    }

    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // Last month reviews
    const lastMonthReviewCount = await Review.countDocuments({
      businessId,
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth }
    });

    const prevMonthReviewCount = await Review.countDocuments({
      businessId,
      createdAt: { $gte: startOfPrevMonth, $lt: startOfLastMonth }
    });

    const lastMonthChange = prevMonthReviewCount
      ? ((lastMonthReviewCount - prevMonthReviewCount) / prevMonthReviewCount * 100).toFixed(2)
      : "N/A";

    // Current month reviews
    const currentMonthReviewCount = await Review.countDocuments({
      businessId,
      createdAt: { $gte: startOfCurrentMonth }
    });

    const currentMonthGrowth = lastMonthReviewCount
      ? ((currentMonthReviewCount - lastMonthReviewCount) / lastMonthReviewCount * 100).toFixed(2)
      : "N/A";

    // Total reviews
    const totalReviews = await Review.countDocuments({ businessId });

    // QR scans this month
    const totalQRScanThisMonth = await QRScan.countDocuments({
      businessId,
      createdAt: { $gte: startOfCurrentMonth }
    });

    // Recent reviews
    const recentReviews = await Review.find({ businessId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Performance analytics
    const allReviews = await Review.find({ businessId });
    const avgRating = allReviews.length
      ? (allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(2)
      : 0;

    const respondedCount = allReviews.filter(r => r.comment && r.comment.trim() !== "").length;
    const responseRate = allReviews.length
      ? ((respondedCount / allReviews.length) * 100).toFixed(2)
      : 0;

    // Performance insights
    let insights = [];
    if (avgRating < 3) insights.push("Your average rating is low — focus on service quality.");
    if (responseRate < 50) insights.push("Increase your response rate to boost customer trust.");
    if (currentMonthGrowth < 0) insights.push("Reviews dropped compared to last month.");

    sendSuccess(res, "Home data fetched successfully", {
      lastMonth: {
        count: lastMonthReviewCount,
        changePercent: lastMonthChange
      },
      currentMonth: {
        count: currentMonthReviewCount,
        growthPercent: currentMonthGrowth
      },
      totalReviews,
      totalQRScanThisMonth,
      recentReviews,
      performanceAnalytics: {
        responseRate,
        avgRating
      },
      performanceInsights: insights
    }, 200);

  } catch (error) {
    console.error(error);
    sendError(res, "Error fetching home data", error.message, 500);
  }
};
