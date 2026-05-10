const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', productCtrl.getAll);
router.get('/:id', productCtrl.getOne);

// Only admin should create (logic can be expanded later)
router.post('/', protect, productCtrl.create);

module.exports = router;
