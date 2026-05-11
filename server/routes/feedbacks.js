const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', ctrl.create);
router.get('/', protect, authorize('superadmin'), ctrl.getAll);

module.exports = router;
