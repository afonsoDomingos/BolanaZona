const express = require('express');
const router = express.Router();
const analyticsCtrl = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Public tracking
router.post('/track', analyticsCtrl.track);

// Admin only stats
router.get('/stats', protect, analyticsCtrl.getStats);

module.exports = router;
