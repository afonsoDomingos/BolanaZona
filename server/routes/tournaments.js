const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tournamentController');
const { protect } = require('../middleware/auth');

router.get('/public/:shareCode', ctrl.getPublic);
router.use(protect);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/generate-calendar', ctrl.generateCalendar);
router.get('/:id/standings', ctrl.getStandings);

module.exports = router;
