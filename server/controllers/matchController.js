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
    const { homeScore, awayScore, events, referee } = req.body;
    
    // Buscar o jogo e o torneio para verificar permissão
    const match = await Match.findById(req.params.id).populate('tournament');
    if (!match) return res.status(404).json({ message: 'Jogo não encontrado.' });

    // 1. Verificar Permissão
    const isOwner = match.tournament.createdBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superadmin';
    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({ message: 'Apenas o organizador do torneio pode inserir resultados.' });
    }

    // 2. Verificar se o jogo já aconteceu
    const now = new Date();
    if (!match.date || new Date(match.date) > now) {
      return res.status(400).json({ message: 'Não podes colocar o resultado de um jogo que ainda não aconteceu ou não tem data definida.' });
    }

    // Proceder com a atualização
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.events = events;
    match.referee = referee;
    match.status = 'finished';
    match.reportedBy = req.user._id;
    
    await match.save();
    
    const updatedMatch = await Match.findById(match._id).populate('homeTeam', 'name color').populate('awayTeam', 'name color');
    res.json(updatedMatch);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate('tournament');
    if (!match) return res.status(404).json({ message: 'Jogo não encontrado.' });

    const isOwner = match.tournament.createdBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superadmin';
    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({ message: 'Sem permissão para editar este jogo.' });
    }

    const updated = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('homeTeam', 'name color').populate('awayTeam', 'name color');
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

