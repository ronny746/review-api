// routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User'); // ensure correct path

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid business id' });
    }

    const user = await User.findById(id).select('-passwordHash -__v');
    if (!user) return res.status(404).json({ error: 'Business not found' });

    res.json(user);
  } catch (err) {
    console.error('GET /api/business/:id error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
