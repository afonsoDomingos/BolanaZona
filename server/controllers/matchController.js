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
    const oldStatus = match.status;

    // 1. Verificar Permissão
    const isOwner = match.tournament?.createdBy && (match.tournament.createdBy.toString() === req.user._id.toString());
    const isSuperAdmin = req.user.role === 'superadmin';
    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({ message: 'Apenas o organizador do torneio ou Superadmin podem inserir resultados.' });
    }

    // 2. Bloquear se as equipas ainda não foram apuradas (slots null) em jogos de knockout
    if (match.phase === 'knockout' && (!match.homeTeam || !match.awayTeam)) {
      return res.status(400).json({
        message: 'Não é possível atualizar este jogo. As equipas ainda não foram apuradas — termina os jogos da ronda anterior primeiro.'
      });
    }

    // 3. Bloquear se a ronda anterior ainda tem jogos por disputar (Mata-Mata)
    if (match.phase === 'knockout' && match.round > 1) {
      const prevRoundMatches = await Match.find({
        tournament: match.tournament._id,
        phase: 'knockout',
        round: match.round - 1
      });

      const pendingInPrevRound = prevRoundMatches.filter(m => m.status !== 'finished' && m.status !== 'cancelled');

      if (pendingInPrevRound.length > 0) {
        const roundName = pendingInPrevRound[0].roundName || `Ronda ${match.round - 1}`;
        return res.status(400).json({
          message: `Não é possível atualizar este jogo. Ainda há ${pendingInPrevRound.length} jogo(s) por disputar na ronda anterior (${roundName}). Termina esses jogos primeiro.`,
          pendingMatches: pendingInPrevRound.length,
          roundName
        });
      }
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
      const teamName = populatedMatch?.[scoringTeam]?.name || (scoringTeam === 'homeTeam' ? 'Equipa Casa' : 'Equipa Fora');
      
      // Notificar Seguidores do Torneio (In-app por agora, expansível para WhatsApp)
      const subscribers = await Subscriber.find({ tournament: match.tournament._id, isActive: true });
      
      // Mensagem de Golo
      const goalMsg = `GOLO da equipa ${teamName}! ⚽ O resultado agora é ${homeScore} - ${awayScore}.`;
      
      console.log(`📡 Notificação de Golo: ${goalMsg}`);
      
      // Notificação interna para o dono do torneio e capitães das equipas
      const captains = await Team.find({ _id: { $in: [match.homeTeam, match.awayTeam].filter(Boolean) } }).select('captains');
      const notifyUsers = [
        match.tournament?.createdBy,
        ...captains.flatMap(c => (Array.isArray(c.captains) ? c.captains : []))
      ].filter(Boolean);
      const uniqueNotifyUsers = [...new Set(notifyUsers.map(id => id?.toString()).filter(Boolean))];

      for (const userId of uniqueNotifyUsers) {
        await createNotification(
          userId,
          'GOLO AO VIVO! ⚽',
          goalMsg,
          'info',
          `/dashboard/tournaments/${match.tournament._id}`
        );
      }
    }

    // 3.5. Notificação de Jogo Terminado (Final Score)
    if (match.status === 'finished' && oldStatus !== 'finished') {
      const populatedMatch = await Match.findById(match._id).populate('homeTeam awayTeam');
      const homeName = populatedMatch?.homeTeam?.name || 'Equipa A';
      const awayName = populatedMatch?.awayTeam?.name || 'Equipa B';
      const finishMsg = `Jogo Terminado: ${homeName} ${homeScore} - ${awayScore} ${awayName}. Placar final confirmado! 🏁`;

      const captains = await Team.find({ _id: { $in: [match.homeTeam, match.awayTeam].filter(Boolean) } }).select('captains');
      const notifyUsers = [
        match.tournament?.createdBy,
        ...captains.flatMap(c => (Array.isArray(c.captains) ? c.captains : []))
      ].filter(Boolean);
      const uniqueNotifyUsers = [...new Set(notifyUsers.map(id => id?.toString()).filter(Boolean))];

      for (const userId of uniqueNotifyUsers) {
        await createNotification(
          userId,
          'Jogo Terminado 🏁',
          finishMsg,
          'success',
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

    const isOwner = match.tournament?.createdBy && (match.tournament.createdBy.toString() === req.user._id.toString());
    const isSuperAdmin = req.user.role === 'superadmin';
    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({ message: 'Sem permissão para editar este jogo. Apenas o criador do torneio ou Superadmin.' });
    }

    const updated = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('homeTeam', 'name color').populate('awayTeam', 'name color');
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.incrementViews = async (req, res) => {
  try {
    const m = await Match.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!m) return res.status(404).json({ message: 'Jogo não encontrado.' });
    res.json({ views: m.views || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likeMatch = async (req, res) => {
  try {
    const m = await Match.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!m) return res.status(404).json({ message: 'Jogo não encontrado.' });
    res.json({ likes: m.likes || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unlikeMatch = async (req, res) => {
  try {
    const m = await Match.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: -1 } },
      { new: true }
    );
    if (!m) return res.status(404).json({ message: 'Jogo não encontrado.' });
    res.json({ likes: m.likes || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

