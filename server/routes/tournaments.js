const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove, generateCalendar, getStandings, getPublic, getAllPublicTournaments } = require('../controllers/tournamentController');
const sponsorCtrl = require('../controllers/sponsorController');
const { protect } = require('../middleware/auth');

// Public routes (no auth needed)
router.get('/public/all', getAllPublicTournaments);
router.get('/public/:shareCode', getPublic);
router.post('/:tournamentId/sponsor-proposals', sponsorCtrl.create);

// Protected routes (auth needed)
router.use(protect);
router.get('/', getAll);
router.post('/', create);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/generate-calendar', generateCalendar);
router.get('/:id/standings', getStandings);
router.get('/:tournamentId/sponsor-proposals', sponsorCtrl.getByTournament);
router.put('/sponsor-proposals/:id', sponsorCtrl.updateStatus);

// Match management
router.post('/:id/matches', require('../controllers/tournamentController').createMatch);
router.delete('/:id/matches/:matchId', require('../controllers/tournamentController').removeMatch);

module.exports = router;
