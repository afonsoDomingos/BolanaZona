const express = require('express');
const router = express.Router();
const leadCtrl = require('../controllers/leadController');
const { protect } = require('../middleware/auth');

// Public capture
router.post('/', leadCtrl.create);

// Admin management
router.use(protect);
router.get('/', leadCtrl.getAll);
router.put('/:id', leadCtrl.updateStatus);

module.exports = router;
