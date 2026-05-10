const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getByTournament);
router.put('/:id', ctrl.update);
router.put('/:id/result', ctrl.updateResult);

module.exports = router;
