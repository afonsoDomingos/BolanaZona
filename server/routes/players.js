const express = require('express');
const router = express.Router();
const playerCtrl = require('../controllers/playerController');

router.get('/ranking', playerCtrl.getTalentRanking);

module.exports = router;
