const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

router.post('/public-register', ctrl.registerPublicTeam);

router.use(protect);
router.get('/', ctrl.getByTournament);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
