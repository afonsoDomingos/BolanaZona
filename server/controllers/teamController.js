const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

exports.getByTournament = async (req, res) => {
  try {
    const filter = { tournament: req.params.tournamentId };
    // Se não houver user (rota pública), mostrar apenas aprovadas
    if (!req.user) {
      filter.status = 'approved';
    }
    const teams = await Team.find(filter);
    res.json(teams);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.registerPublicTeam = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Torneio não encontrado.' });
    // Se quiseres podes ativar a validação de inscrições abertas, mas por defeito deixamos ativo
    // if (tournament.status !== 'registration' && tournament.status !== 'draft') {
    //   return res.status(403).json({ message: 'As inscrições para este torneio estão fechadas.' });
    // }

    const team = await Team.create({ 
      ...req.body, 
      tournament: tournament._id, 
      status: 'pending', 
      createdBy: tournament.createdBy // Atribuímos ao dono do torneio para gestão
    });
    res.status(201).json({ message: 'Inscrição submetida com sucesso! Aguarda a aprovação do organizador.', team });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const team = await Team.create({ ...req.body, tournament: req.params.tournamentId, status: 'approved', createdBy: req.user._id });
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
