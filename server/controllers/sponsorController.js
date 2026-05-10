const SponsorProposal = require('../models/SponsorProposal');
const Notification = require('../models/Notification');
const Tournament = require('../models/Tournament');

exports.create = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: 'Torneio não encontrado.' });

    const proposal = await SponsorProposal.create({
      ...req.body,
      tournament: tournamentId
    });

    // Notificar o organizador
    await Notification.create({
      user: tournament.createdBy,
      type: 'info',
      title: 'Nova Proposta de Patrocínio! 🤝',
      message: `${req.body.name} enviou uma proposta para apoiar o torneio "${tournament.name}".`,
      link: `/dashboard/tournaments/${tournamentId}?tab=sponsors`
    });

    res.status(201).json({ message: 'Proposta enviada com sucesso! O organizador será notificado.', proposal });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getByTournament = async (req, res) => {
  try {
    const proposals = await SponsorProposal.find({ tournament: req.params.tournamentId }).sort('-createdAt');
    res.json(proposals);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const proposal = await SponsorProposal.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(proposal);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
