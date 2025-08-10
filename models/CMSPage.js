// models/CMSPage.js
const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true }, // e.g. "about-us"
  title: { type: String, required: true },
  content: { type: String, required: true }, // HTML ya Markdown
  metaTitle: { type: String },
  metaDescription: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CMSPage', cmsPageSchema);
