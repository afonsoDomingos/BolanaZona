const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.post('/', protect, ctrl.create);
router.post('/:id/like', protect, ctrl.toggleLike);

module.exports = router;
