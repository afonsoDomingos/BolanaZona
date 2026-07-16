const express = require('express');
const router = express.Router();
const analyticsCtrl = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Public tracking
router.post('/track', analyticsCtrl.track);
router.get('/total-visits', analyticsCtrl.getTotalVisits);

// Superadmin only stats
router.get('/stats', protect, authorize('superadmin'), analyticsCtrl.getStats);

module.exports = router;
