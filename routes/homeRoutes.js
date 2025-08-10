
const express = require("express");
const { getHomeData } = require("../controllers/homeConteoller");
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/home/:businessId
router.get("/", authMiddleware, getHomeData);

module.exports = router;
