const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/suggestionController');
const { protect, authorize } = require('../middleware/auth');

// Rota pública para criar sugestões (ou com proteção opcional)
router.post('/', ctrl.create);

// Apenas admin pode ver as sugestões
router.get('/', protect, authorize('superadmin'), ctrl.getAll);

module.exports = router;
