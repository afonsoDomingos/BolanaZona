const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/me', protect, authCtrl.me);
router.post('/forgot-password', authCtrl.forgotPassword);
router.patch('/reset-password/:token', authCtrl.resetPassword);

module.exports = router;
