const express = require('express');
const router = express.Router();
const galleryCtrl = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', galleryCtrl.getPublic);

router.use(protect);
router.use(authorize('superadmin'));
router.get('/manage', galleryCtrl.getAll);
router.post('/', galleryCtrl.create);
router.put('/:id', galleryCtrl.update);
router.delete('/:id', galleryCtrl.remove);

module.exports = router;
