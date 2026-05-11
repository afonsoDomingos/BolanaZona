const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/suggestionController');
const { protect, admin } = require('../middleware/auth');

// Rota pública para criar sugestões (ou com proteção opcional)
router.post('/', ctrl.create);

// Apenas admin pode ver as sugestões
router.get('/', protect, admin, ctrl.getAll);

module.exports = router;
