const Match = require('../models/Match');

exports.getByTournament = async (req, res) => {
  try {
    const matches = await Match.find({ tournament: req.params.tournamentId })
      .populate('homeTeam', 'name color logo')
      .populate('awayTeam', 'name color logo')
      .sort({ round: 1, date: 1 });
    res.json(matches);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateResult = async (req, res) => {
  try {
    const { homeScore, awayScore } = req.body;
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { homeScore, awayScore, status: 'finished', reportedBy: req.user._id },
      { new: true }
    ).populate('homeTeam', 'name color').populate('awayTeam', 'name color');
    if (!match) return res.status(404).json({ message: 'Jogo não encontrado.' });
    res.json(match);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('homeTeam', 'name color').populate('awayTeam', 'name color');
    if (!match) return res.status(404).json({ message: 'Jogo não encontrado.' });
    res.json(match);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
