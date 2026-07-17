const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getAll);
router.put('/:id/read', ctrl.markAsRead);
router.put('/read-all', ctrl.markAllAsRead);
router.delete('/clear', ctrl.clearAll);
router.get('/preferences', ctrl.getPreferences);
router.put('/preferences', ctrl.updatePreferences);

module.exports = router;
