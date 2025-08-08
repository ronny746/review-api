const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    company: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
