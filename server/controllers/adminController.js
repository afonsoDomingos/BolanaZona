const Team = require('../models/Team');
const Squad = require('../models/Squad');
const Tournament = require('../models/Tournament');

exports.getCentralDeEquipas = async (req, res) => {
  try {
    // Buscar todos os Squads (Clubes autónomos)
    const squads = await Squad.find()
      .populate('manager', 'name phone')
      .sort('-createdAt');

    // Buscar todos os Teams (Equipas dentro de torneios)
    const teams = await Team.find()
      .populate({
        path: 'tournament',
        select: 'name shareCode neighborhood'
      })
      .sort('-createdAt');

    res.json({ squads, teams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipa de torneio eliminada.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSquad = async (req, res) => {
  try {
    await Squad.findByIdAndDelete(req.params.id);
    res.json({ message: 'Clube global eliminado.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
