const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove, generateCalendar, getStandings, getPublic, getAllPublicTournaments } = require('../controllers/tournamentController');
const { protect } = require('../middleware/auth');

// Public routes (no auth needed)
router.get('/public/all', getAllPublicTournaments);
router.get('/public/:shareCode', getPublic);

// Protected routes (auth needed)
router.use(protect);
router.get('/', getAll);
router.post('/', create);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/generate-calendar', generateCalendar);
router.get('/:id/standings', getStandings);

module.exports = router;
