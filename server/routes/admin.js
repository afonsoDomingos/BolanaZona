const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('superadmin', 'admin'));

router.get('/central-equipas', ctrl.getCentralDeEquipas);
router.delete('/teams/:id', ctrl.deleteTeam);
router.delete('/squads/:id', ctrl.deleteSquad);

module.exports = router;
