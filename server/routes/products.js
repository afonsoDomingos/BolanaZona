const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', productCtrl.getAll);
router.get('/:id', productCtrl.getOne);

// Admin and Superadmin routes
router.use(protect);
router.use(authorize('superadmin', 'admin'));
router.post('/', productCtrl.create);
router.put('/:id', productCtrl.update);
router.delete('/:id', productCtrl.remove);

module.exports = router;
