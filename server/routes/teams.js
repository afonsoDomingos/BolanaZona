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
router.put('/:id/link-manager', ctrl.linkManager);
router.post('/:id/invite-code', ctrl.generateInviteCode);
router.post('/accept-invite/:code', ctrl.acceptInvite);



module.exports = router;
