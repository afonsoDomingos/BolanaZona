const express = require('express');
const router = express.Router();
const partnerCtrl = require('../controllers/partnerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', partnerCtrl.getPublic);

router.use(protect);
router.use(authorize('superadmin'));
router.get('/manage', partnerCtrl.getAll);
router.post('/', partnerCtrl.create);
router.put('/:id', partnerCtrl.update);
router.delete('/:id', partnerCtrl.remove);

module.exports = router;
