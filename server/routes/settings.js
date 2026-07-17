const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, authorize } = require('../middleware/auth');

// Get a setting by key (public)
router.get('/:key', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) {
      // Retornar valor padrão para keys específicas
      const defaultValues = {
        'youtube_shorts': { enabled: false, apiKey: '' },
        'analytics': { enabled: true },
        'maintenance': { enabled: false }
      };
      
      if (defaultValues[req.params.key]) {
        return res.json({ key: req.params.key, value: defaultValues[req.params.key] });
      }
      
      return res.status(404).json({ message: 'Definição não encontrada.' });
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update or create a setting by key (superadmin only)
router.put('/:key', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { value } = req.body;
    let setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
