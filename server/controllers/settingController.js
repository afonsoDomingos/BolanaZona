const Setting = require('../models/Setting');

exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({ message: 'Definição não encontrada.' });
    }
    
    res.json(setting.value);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.setSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.find({});
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
