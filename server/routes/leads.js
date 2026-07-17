const express = require('express');
const router = express.Router();
const leadCtrl = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

// Public capture
router.post('/', leadCtrl.create);

// Superadmin only management (store sales)
router.use(protect);
router.use(authorize('superadmin'));
router.get('/', leadCtrl.getAll);
router.put('/:id', leadCtrl.updateStatus);
router.put('/:id/status', leadCtrl.updateStatus);

module.exports = router;
