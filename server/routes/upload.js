const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
  res.json({ url: req.file.path, public_id: req.file.filename });
});

router.post('/public', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
  res.json({ url: req.file.path, public_id: req.file.filename });
});

module.exports = router;
