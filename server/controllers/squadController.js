const Squad = require('../models/Squad');

exports.getMySquads = async (req, res) => {
  try {
    const squads = await Squad.find({ manager: req.user._id }).sort('-createdAt');
    res.json(squads);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const squad = await Squad.create({ ...req.body, manager: req.user._id });
    res.status(201).json(squad);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const squad = await Squad.findOneAndUpdate(
      { _id: req.params.id, manager: req.user._id }, 
      req.body, 
      { new: true }
    );
    if (!squad) return res.status(404).json({ message: 'Clube não encontrado ou sem permissão.' });
    res.json(squad);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const squad = await Squad.findOneAndDelete({ _id: req.params.id, manager: req.user._id });
    if (!squad) return res.status(404).json({ message: 'Clube não encontrado.' });
    res.json({ message: 'Clube eliminado.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPublicSquad = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id).populate('manager', 'name');
    if (!squad) return res.status(404).json({ message: 'Clube não encontrado.' });
    res.json(squad);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
