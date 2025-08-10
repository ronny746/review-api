// controllers/cmsController.js
const CMSPage = require('../models/CMSPage');

// Add new CMS page
exports.createPage = async (req, res) => {
  try {
    const { slug, title, content, metaTitle, metaDescription } = req.body;
    const page = new CMSPage({ slug, title, content, metaTitle, metaDescription });
    await page.save();
    res.json({ message: 'CMS page created', page });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get page by slug
exports.getPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await CMSPage.findOne({ slug });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update page
exports.updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const updates = req.body;
    const page = await CMSPage.findOneAndUpdate({ slug }, { $set: updates }, { new: true });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json({ message: 'Page updated', page });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
