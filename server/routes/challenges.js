const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { protect } = require('../middleware/auth');

router.post('/', protect, challengeController.create);
router.get('/my-challenges', protect, challengeController.getMyChallenges);
router.put('/:id', protect, challengeController.update);
router.put('/:id/status', protect, challengeController.updateStatus);

module.exports = router;
