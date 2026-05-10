const Team = require('../models/Team');

exports.getByTournament = async (req, res) => {
  try {
    const teams = await Team.find({ tournament: req.params.tournamentId });
    res.json(teams);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const team = await Team.create({ ...req.body, tournament: req.params.tournamentId, createdBy: req.user._id });
    res.status(201).json(team);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!team) return res.status(404).json({ message: 'Equipa não encontrada.' });
    res.json(team);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipa eliminada.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
