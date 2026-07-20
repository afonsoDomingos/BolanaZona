const express = require('express');
const router = express.Router();
const leadCtrl = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

// Public capture
router.post('/', leadCtrl.create);

// Management (Admin & Tournament Organizers)
router.use(protect);
router.get('/', leadCtrl.getAll);
router.put('/:id', leadCtrl.updateStatus);
router.put('/:id/status', leadCtrl.updateStatus);

module.exports = router;
