const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const multer = require('multer');

// Storage de memória para fallback em caso de erro no Cloudinary
const memoryUpload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 20 * 1024 * 1024 } 
});

const handleUpload = (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.warn('⚠️ [UPLOAD WARN] Cloudinary upload falhou, a aplicar fallback:', err.message);
      memoryUpload.single('image')(req, res, (memErr) => {
        if (memErr || !req.file) {
          console.error('❌ [UPLOAD ERROR]', memErr || err);
          return res.status(500).json({ message: err?.message || memErr?.message || 'Erro ao processar imagem.' });
        }
        const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        return res.json({ url: base64, public_id: 'local_fallback' });
      });
    } else {
      if (!req.file) return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
      res.json({ url: req.file.path, public_id: req.file.filename });
    }
  });
};

router.post('/', protect, handleUpload);
router.post('/public', handleUpload);

module.exports = router;
