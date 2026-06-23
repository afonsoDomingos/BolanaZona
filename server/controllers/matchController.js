const Match = require('../models/Match');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');
const Subscriber = require('../models/Subscriber');
const { create: createNotification } = require('./notificationController');

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
    const { homeScore, awayScore, events, referee, status } = req.body;
    
    // Buscar o jogo e o torneio para verificar permissão
    const match = await Match.findById(req.params.id).populate('tournament');
    if (!match) return res.status(404).json({ message: 'Jogo não encontrado.' });

    const oldHomeScore = match.homeScore || 0;
    const oldAwayScore = match.awayScore || 0;

    // 1. Verificar Permissão
    const isOwner = match.tournament.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Apenas o organizador do torneio pode inserir resultados.' });
    }

    // 2. Verificar se o jogo já aconteceu (apenas se for para finalizar)
    const now = new Date();
    if ((!match.date || new Date(match.date) > now) && status === 'finished') {
      return res.status(400).json({ message: 'Não podes finalizar um jogo que ainda não aconteceu.' });
    }

    // Proceder com a atualização
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.events = events;
    match.referee = referee;
    match.status = status || 'finished';
    match.reportedBy = req.user._id;
    
    await match.save();

    // 3. Notificações de Golo / Eventos em Direto
    if (homeScore > oldHomeScore || awayScore > oldAwayScore) {
      const scoringTeam = homeScore > oldHomeScore ? 'homeTeam' : 'awayTeam';
      const populatedMatch = await Match.findById(match._id).populate('homeTeam awayTeam');
      const teamName = populatedMatch[scoringTeam].name;
      
      // Notificar Seguidores do Torneio (In-app por agora, expansível para WhatsApp)
      const subscribers = await Subscriber.find({ tournament: match.tournament._id, isActive: true });
      
      // Mensagem de Golo
      const goalMsg = `GOLO da equipa ${teamName}! ⚽ O resultado agora é ${homeScore} - ${awayScore}.`;
      
      console.log(`📡 Notificação de Golo: ${goalMsg}`);
      
      // Aqui poderíamos chamar um serviço de WhatsApp para os telefones em subscribers.map(s => s.phone)
      // Por agora, vamos garantir que a notificação interna chegue ao dono do torneio e capitães
      const captains = await Team.find({ _id: { $in: [match.homeTeam, match.awayTeam] } }).select('captains');
      const notifyUsers = [match.tournament.createdBy, ...captains.flatMap(c => c.captains).filter(Boolean)];

      for (const userId of notifyUsers) {
        await createNotification(
          userId,
          'GOLO AO VIVO! ⚽',
          goalMsg,
          'info',
          `/dashboard/tournaments/${match.tournament._id}`
        );
      }
    }
    
    // 4. Progressão Automática na Árvore (Mata-Mata)
    if (match.phase === 'knockout' && match.status === 'finished') {
      const winnerId = match.homeScore > match.awayScore ? match.homeTeam : 
                       (match.awayScore > match.homeScore ? match.awayTeam : null);
      
      if (winnerId) {
        const allMatches = await Match.find({ tournament: match.tournament._id, phase: 'knockout' }).sort({ round: 1, _id: 1 });
        const currentRoundMatches = allMatches.filter(m => m.round === match.round);
        const matchIndex = currentRoundMatches.findIndex(m => m._id.toString() === match._id.toString());
        
        if (matchIndex !== -1) {
          const nextRoundMatches = allMatches.filter(m => m.round === match.round + 1);
          if (nextRoundMatches.length > 0) {
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const nextMatch = nextRoundMatches[nextMatchIndex];
            
            if (nextMatch) {
              const isHome = matchIndex % 2 === 0;
              if (isHome) {
                nextMatch.homeTeam = winnerId;
              } else {
                nextMatch.awayTeam = winnerId;
              }
              await nextMatch.save();
            }
          }
        }
      }
    }

    const updatedMatch = await Match.findById(match._id)
      .populate('homeTeam', 'name color logo')
      .populate('awayTeam', 'name color logo');
    res.json(updatedMatch);

  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate('tournament');
    if (!match) return res.status(404).json({ message: 'Jogo não encontrado.' });

    const isOwner = match.tournament.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Sem permissão para editar este jogo.' });
    }

    const updated = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('homeTeam', 'name color').populate('awayTeam', 'name color');
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

