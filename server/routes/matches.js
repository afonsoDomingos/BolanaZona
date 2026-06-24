const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

// Public routes for views and likes
router.post('/:id/view', ctrl.incrementViews);
router.post('/:id/like', ctrl.likeMatch);
router.post('/:id/unlike', ctrl.unlikeMatch);

router.use(protect);
router.get('/', ctrl.getByTournament);
router.put('/:id', ctrl.update);
router.put('/:id/result', ctrl.updateResult);

module.exports = router;
