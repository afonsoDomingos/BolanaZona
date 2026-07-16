const express = require('express');
const router = express.Router();
const leadCtrl = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

// Public capture
router.post('/', leadCtrl.create);

// Admin management
router.use(protect);
router.use(authorize('superadmin', 'admin'));
router.get('/', leadCtrl.getAll);
router.put('/:id', leadCtrl.updateStatus);
router.put('/:id/status', leadCtrl.updateStatus);

module.exports = router;
