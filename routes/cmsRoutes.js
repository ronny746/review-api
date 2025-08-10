// routes/cmsRoutes.js
const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

router.post('/', cmsController.createPage);
router.get('/:slug', cmsController.getPage);
router.put('/:slug', cmsController.updatePage);

module.exports = router;
