const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, userController.getMe);
router.put('/profile', protect, userController.updateProfile);

// Admin Routes
router.get('/', protect, authorize('superadmin', 'admin'), userController.getAllUsers);
router.put('/:id', protect, authorize('superadmin', 'admin'), userController.adminUpdateUser);
router.delete('/:id', protect, authorize('superadmin', 'admin'), userController.deleteUser);

module.exports = router;
