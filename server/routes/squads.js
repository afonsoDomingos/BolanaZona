const express = require('express');
const router = express.Router();
const squadController = require('../controllers/squadController');
const { protect } = require('../middleware/auth');

router.get('/my-squads', protect, squadController.getMySquads);
router.post('/', protect, squadController.create);
router.put('/:id', protect, squadController.update);
router.delete('/:id', protect, squadController.remove);

router.get('/public-all', squadController.getAllPublicSquads);
router.get('/public/:id', squadController.getPublicSquad);

module.exports = router;
