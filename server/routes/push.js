const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pushController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/subscribe', ctrl.subscribe);
router.post('/unsubscribe', ctrl.unsubscribe);
router.get('/vapid-public-key', ctrl.getVapidPublicKey);

module.exports = router;
