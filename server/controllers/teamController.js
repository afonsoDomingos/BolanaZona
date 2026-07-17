const Team = require('../models/Team');
const Tournament = require('../models/Tournament');
const { create: createNotification } = require('./notificationController');

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

exports.getMyManagedTeams = async (req, res) => {
  try {
    const teams = await Team.find({ captains: req.user._id })
      .populate('tournament', 'name shareCode status')
      .sort('-createdAt');
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

    await createNotification(
      tournament.createdBy,
      'Nova Inscrição Pendente 📋',
      `A equipa "${team.name}" submeteu uma inscrição para o torneio "${tournament.name}".`,
      'info',
      `/dashboard/tournaments/${tournament._id}`
    );

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
    const team = await Team.findById(req.params.id).populate('tournament');
    if (!team) return res.status(404).json({ message: 'Equipa não encontrada.' });

    const isCaptain = team.captains && team.captains.some(c => c.toString() === req.user._id.toString());
    const isOwner = team.tournament.createdBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superadmin';

    if (!isCaptain && !isOwner && !isSuperAdmin) {
      return res.status(403).json({ message: 'Sem permissão para editar esta equipa. Apenas capitães, criador do torneio ou Superadmin.' });
    }

    const oldStatus = team.status;
    const newStatus = req.body.status;

    const updated = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('tournament');

    if (newStatus && newStatus !== oldStatus) {
      const notifyUsers = [updated.createdBy, ...(updated.captains || [])].filter(Boolean);
      const uniqueNotifyUsers = [...new Set(notifyUsers.map(id => id.toString()))];

      if (newStatus === 'approved') {
        for (const captainId of uniqueNotifyUsers) {
          await createNotification(
            captainId,
            'Inscrição Aprovada! 🏆',
            `A tua equipa "${updated.name}" foi aceite no torneio "${updated.tournament.name}".`,
            'success',
            `/dashboard/tournaments/${updated.tournament._id}`
          );
        }
      } else if (newStatus === 'rejected') {
        for (const captainId of uniqueNotifyUsers) {
          await createNotification(
            captainId,
            'Inscrição Recusada ❌',
            `A inscrição da tua equipa "${updated.name}" no torneio "${updated.tournament.name}" foi recusada pelo organizador.`,
            'warning',
            `/explore`
          );
        }
      }
    }

    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};


exports.remove = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('tournament');
    if (!team) return res.status(404).json({ message: 'Equipa não encontrada.' });

    const isCaptain = team.captains && team.captains.some(c => c.toString() === req.user._id.toString());
    const isOwner = team.tournament && team.tournament.createdBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superadmin';

    if (!isCaptain && !isOwner && !isSuperAdmin) {
      return res.status(403).json({ message: 'Não tens permissão para eliminar esta equipa. Apenas capitães, criador do torneio ou Superadmin.' });
    }

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

    if (!team.captains.includes(userId)) {
      team.captains.push(userId);
    }
    await team.save();

    const updated = await Team.findById(team._id).populate('captains', 'name phone email');
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

    if (team.captains.includes(req.user._id)) {
      return res.status(400).json({ message: 'Já és gestor desta equipa.' });
    }

    team.captains.push(req.user._id);
    await team.save();

    res.json({ message: 'Convite aceite com sucesso!', teamId: team._id, tournamentId: team.tournament });

  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.unlinkManager = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('tournament');
    if (!team) return res.status(404).json({ message: 'Equipa não encontrada.' });

    const isCurrentCaptain = team.captains.some(c => c.toString() === req.user._id.toString());
    const isOwner = team.tournament.createdBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superadmin';

    if (!isCurrentCaptain && !isOwner && !isSuperAdmin) {
      return res.status(403).json({ message: 'Sem permissão para remover a gestão desta equipa.' });
    }

    team.captains = team.captains.filter(c => c.toString() !== req.user._id.toString());
    await team.save();

    res.json({ message: 'Gestão removida com sucesso.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};




