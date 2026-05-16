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

exports.linkManager = async (req, res) => {
  try {
    const { userId } = req.body;
    const team = await Team.findById(req.params.id).populate('tournament');
    if (!team) return res.status(404).json({ message: 'Equipa não encontrada.' });

    // Verificar se o utilizador atual é o dono do torneio ou admin
    const isOwner = team.tournament.createdBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superadmin';
    
    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({ message: 'Sem permissão para vincular gestores nesta equipa.' });
    }

    team.captain = userId;
    await team.save();

    const updated = await Team.findById(team._id).populate('captain', 'name phone email');
    res.json({ message: 'Gestor vinculado com sucesso!', team: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.generateInviteCode = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('tournament');
    if (!team) return res.status(404).json({ message: 'Equipa não encontrada.' });

    const isOwner = team.tournament.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Sem permissão.' });
    }

    const { v4: uuidv4 } = require('uuid');
    team.invitationCode = uuidv4().substring(0, 12).toUpperCase();
    await team.save();

    res.json({ invitationCode: team.invitationCode });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.acceptInvite = async (req, res) => {
  try {
    const { code } = req.params;
    const team = await Team.findOne({ invitationCode: code });
    if (!team) return res.status(404).json({ message: 'Convite inválido ou expirado.' });

    if (team.captain) {
      return res.status(400).json({ message: 'Esta equipa já tem um gestor vinculado.' });
    }

    team.captain = req.user._id;
    // Opcional: invalidar o código após uso ou manter para outros membros?
    // Por agora mantemos o vínculo um-para-um.
    await team.save();

    res.json({ message: 'Convite aceite com sucesso!', teamId: team._id, tournamentId: team.tournament });
  } catch (err) { res.status(500).json({ message: err.message }); }
};


