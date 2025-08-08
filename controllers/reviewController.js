const Review = require("../models/Review");

// @desc    Get all reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new review
exports.createReview = async (req, res) => {
  try {
    const { name, mobile, rating, comment, company } = req.body;
    if (!name || !rating || !company) {
      return res.status(400).json({ message: "Name, rating, and company are required" });
    }
    const review = await Review.create({ name, mobile, rating, comment, company });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
