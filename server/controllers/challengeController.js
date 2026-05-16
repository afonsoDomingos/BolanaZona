const Challenge = require('../models/Challenge');
const Squad = require('../models/Squad');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.create = async (req, res) => {
  console.log('⚡️ Creating challenge - payload:', req.body, 'user:', req.user._id);
  try {
    const { challengerSquad, challengedSquad, date, location, message, type, wagerValue, mapsLink } = req.body;
    
    if (challengerSquad === challengedSquad) {
      return res.status(400).json({ message: 'Não podes desafiar o teu próprio clube!' });
    }

    // Check if there is already an active challenge (pending or accepted for future)
    const existingChallenge = await Challenge.findOne({
      $or: [
        { status: 'pending' },
        { status: 'accepted', date: { $gte: new Date().setHours(0, 0, 0, 0) } }
      ],
      $or: [
        { challengerSquad, challengedSquad },
        { challengerSquad: challengedSquad, challengedSquad: challengerSquad }
      ]
    });

    if (existingChallenge) {
      const reason = existingChallenge.status === 'pending' 
        ? 'Já existe um desafio pendente.' 
        : 'Já existe um jogo agendado que ainda não aconteceu.';
      return res.status(400).json({ message: `${reason} Espera o desfecho antes de novo desafio.` });
    }

    // Verify that the user actually owns the challenger squad
    const challenger = await Squad.findOne({ _id: challengerSquad, manager: req.user._id });
    if (!challenger) {
      console.warn('❌ User not manager of challenger squad');
      return res.status(403).json({ message: 'Não és o gestor do clube desafiador.' });
    }

    // Get the challenged squad and its manager's contact
    const challenged = await Squad.findById(challengedSquad).populate('manager', 'name phone');
    if (!challenged) {
      console.warn('❌ Challenged squad not found');
      return res.status(404).json({ message: 'Clube desafiado não encontrado.' });
    }

    const challenge = await Challenge.create({ challengerSquad, challengedSquad, date, location, message, type, wagerValue, mapsLink });
    console.log('✅ Challenge created with id', challenge._id);

    // Build WhatsApp notification
    const recipientPhone = (challenged.contact || challenged.manager?.phone || '').replace(/\D/g, '');
    let whatsappLink = null;
    if (recipientPhone) {
      const dateStr = date
        ? new Date(date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : 'A definir';
      const playerCount = challenger.players?.length || 0;
      const captainPlayer = challenger.players?.find(p => p.isCaptain);
      const waMessage = [
        `⚔️ *DESAFIO DE AMISTOSO - BOLA NA ZONA* ⚔️`,
        '',
        `Olá, *${challenged.name}*! 👋`,
        `A equipa *${challenger.name}* lançou-vos um desafio!`,
        '',
        `📋 *Detalhes do Clube Desafiador:*`,
        `🛡️ Equipa: ${challenger.name}`,
        `📍 Bairro: ${challenger.neighborhood || 'Não indicado'}`,
        `👥 Plantel: ${playerCount} jogadores`,
        captainPlayer ? `👑 Capitão: ${captainPlayer.name}` : null,
        challenger.contact ? `📞 Contacto: ${challenger.contact}` : null,
        '',
        `📅 *Proposta de Jogo:*`,
        `🗓️ Data: ${dateStr}`,
        location ? `🏟️ Campo: ${location}` : `🏟️ Campo: A definir`,
        mapsLink ? `📍 Localização: ${mapsLink}` : null,
        `🏆 Tipo: ${type === 'wager' ? `💰 Aposta (${wagerValue || 'A definir'})` : '🤝 Amigável'}`,
        message ? `💬 Mensagem: "${message}"` : null,
        '',
        `✅ Para *ACEITAR* ou ❌ *RECUSAR* o desafio, entra na tua conta em *bolanazona.com* → Meus Clubes → Desafios`,
        '',
        `🚀 _Bola na Zona - O futebol do bairro, agora profissional._`
      ].filter(Boolean).join('\n');
      whatsappLink = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(waMessage)}`;
    }

    // Create Internal Notification for the challenged manager
    await Notification.create({
      user: challenged.manager._id,
      title: type === 'wager' ? 'Novo Desafio com Aposta! 💰' : 'Novo Desafio! ⚔️',
      message: `A equipa ${challenger.name} lançou um desafio ${type === 'wager' ? `com aposta (${wagerValue})` : 'amigável'} para o dia ${date ? new Date(date).toLocaleDateString() : 'a definir'}.`,
      type: type === 'wager' ? 'warning' : 'info',
      link: '/dashboard/squads'
    });

    res.status(201).json({ challenge, whatsappLink });
  } catch (err) {
    console.error('❗️ Error creating challenge:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getMyChallenges = async (req, res) => {
  console.log('🔍 Fetching challenges for user', req.user._id);
  try {
    const mySquads = await Squad.find({ manager: req.user._id }).select('_id');
    const mySquadIds = mySquads.map(s => s._id);
    const challenges = await Challenge.find({
      $or: [
        { challengerSquad: { $in: mySquadIds } },
        { challengedSquad: { $in: mySquadIds } }
      ]
    })
      .populate('challengerSquad')
      .populate('challengedSquad')
      .sort('-createdAt');
    console.log(`✅ Retrieved ${challenges.length} challenges`);
    res.json(challenges);
  } catch (err) {
    console.error('❗️ Error fetching challenges:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  console.log('🔄 Updating challenge status', req.params.id, 'to', req.body.status, 'by user', req.user._id);
  try {
    const { status, rejectionReason } = req.body;
    const challenge = await Challenge.findById(req.params.id)
      .populate('challengedSquad')
      .populate('challengerSquad');

    if (!challenge) {
      console.warn('❌ Challenge not found');
      return res.status(404).json({ message: 'Desafio não encontrado.' });
    }

    const isChallengedManager = challenge.challengedSquad.manager.toString() === req.user._id.toString();
    const isChallengerManager = challenge.challengerSquad.manager.toString() === req.user._id.toString();

    if (!isChallengedManager && !isChallengerManager) {
      console.warn('❌ User without permission to update challenge');
      return res.status(403).json({ message: 'Sem permissão.' });
    }

    challenge.status = status;
    if (rejectionReason) challenge.rejectionReason = rejectionReason;
    await challenge.save();
    console.log('✅ Challenge status updated to', status);

    let whatsappLink = null;
    const recipientPhone = (challenge.challengerSquad.contact || challenge.challengerSquad.manager?.phone || '').replace(/\D/g, '');
    
    if (recipientPhone && isChallengedManager) {
      if (status === 'accepted') {
        const waMessage = `⚔️ *DESAFIO ACEITE!* ⚔️\n\nOlá, a equipa *${challenge.challengedSquad.name}* acaba de aceitar o vosso desafio no Bola na Zona! 🔥\n\nVamos fechar os detalhes do jogo?`;
        whatsappLink = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(waMessage)}`;
      } else if (status === 'rejected') {
        const waMessage = `Olá! A equipa *${challenge.challengedSquad.name}* não pode aceitar o vosso desafio neste momento.${rejectionReason ? `\n\n*Motivo:* ${rejectionReason}` : ''}\n\nFica para a próxima! ⚽`;
        whatsappLink = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(waMessage)}`;
      }
    }

    // Create Internal Notification for the challenger manager
    await Notification.create({
      user: challenge.challengerSquad.manager,
      title: status === 'accepted' ? 'Desafio Aceite! 🔥' : 'Desafio Recusado ❌',
      message: `A equipa ${challenge.challengedSquad.name} ${status === 'accepted' ? 'aceitou' : 'recusou'} o vosso desafio.${rejectionReason ? ` Motivo: ${rejectionReason}` : ''}`,
      type: status === 'accepted' ? 'success' : 'warning',
      link: '/dashboard/squads'
    });

    res.json({ challenge, whatsappLink });
  } catch (err) {
    console.error('❗️ Error updating challenge status:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  console.log('🔄 Updating challenge details', req.params.id, 'by user', req.user._id);
  try {
    const { date, location, message, type, wagerValue, mapsLink } = req.body;
    const challenge = await Challenge.findById(req.params.id)
      .populate('challengerSquad')
      .populate('challengedSquad');

    if (!challenge) return res.status(404).json({ message: 'Desafio não encontrado.' });

    // Only challenger can edit, and only if pending
    if (challenge.challengerSquad.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }

    if (challenge.status !== 'pending') {
      return res.status(400).json({ message: 'Apenas desafios pendentes podem ser editados.' });
    }

    challenge.date = date || challenge.date;
    challenge.location = location || challenge.location;
    challenge.message = message || challenge.message;
    challenge.type = type || challenge.type;
    challenge.wagerValue = wagerValue || challenge.wagerValue;
    challenge.mapsLink = mapsLink || challenge.mapsLink;

    await challenge.save();
    console.log('✅ Challenge updated successfully');
    res.json(challenge);
  } catch (err) {
    console.error('❗️ Error updating challenge:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateDetails = async (req, res) => {
  console.log('🔄 Updating accepted challenge details', req.params.id, 'by user', req.user._id);
  try {
    const { date, location, mapsLink } = req.body;
    const challenge = await Challenge.findById(req.params.id)
      .populate('challengerSquad')
      .populate('challengedSquad');

    if (!challenge) return res.status(404).json({ message: 'Desafio não encontrado.' });

    // Both managers can update if it's accepted
    const isChallengedManager = challenge.challengedSquad.manager.toString() === req.user._id.toString();
    const isChallengerManager = challenge.challengerSquad.manager.toString() === req.user._id.toString();

    if (!isChallengedManager && !isChallengerManager) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }

    challenge.date = date || challenge.date;
    challenge.location = location || challenge.location;
    challenge.mapsLink = mapsLink || challenge.mapsLink;

    await challenge.save();
    console.log('✅ Challenge details updated successfully');
    res.json(challenge);
  } catch (err) {
    console.error('❗️ Error updating challenge details:', err);
    res.status(500).json({ message: err.message });
  }
};

const updateSquadStats = async (squadId) => {
  try {
    const squad = await Squad.findById(squadId);
    if (!squad) return;

    const challenges = await Challenge.find({
      $or: [
        { challengerSquad: squadId },
        { challengedSquad: squadId }
      ],
      status: 'completed'
    });

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    challenges.forEach(ch => {
      if (!ch.result) return;

      const isChallenger = ch.challengerSquad.toString() === squadId.toString();
      const myScore = isChallenger ? ch.result.challengerScore : ch.result.challengedScore;
      const opponentScore = isChallenger ? ch.result.challengedScore : ch.result.challengerScore;

      goalsFor += myScore;
      goalsAgainst += opponentScore;

      if (myScore > opponentScore) {
        wins++;
      } else if (myScore < opponentScore) {
        losses++;
      } else {
        draws++;
      }
    });

    squad.stats = {
      matchesPlayed: challenges.length,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      tournamentsWon: squad.stats?.tournamentsWon || 0
    };

    await squad.save();
    console.log(`📊 Stats recalculated for squad ${squad.name}: Wins: ${wins}, Losses: ${losses}, Matches: ${challenges.length}`);
  } catch (err) {
    console.error('❌ Error recalculating squad stats:', err);
  }
};

exports.updateResult = async (req, res) => {
  console.log('🏁 Updating challenge result', req.params.id, 'by user', req.user._id);
  try {
    const { challengerScore, challengedScore } = req.body;
    const challenge = await Challenge.findById(req.params.id)
      .populate('challengerSquad')
      .populate('challengedSquad');

    if (!challenge) return res.status(404).json({ message: 'Desafio não encontrado.' });

    // Both managers can update result
    const isChallengedManager = challenge.challengedSquad.manager.toString() === req.user._id.toString();
    const isChallengerManager = challenge.challengerSquad.manager.toString() === req.user._id.toString();

    if (!isChallengedManager && !isChallengerManager) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }

    challenge.result = {
      challengerScore: Number(challengerScore),
      challengedScore: Number(challengedScore),
      confirmed: true
    };
    challenge.status = 'completed';

    await challenge.save();

    // Recalculate stats for both squads
    await updateSquadStats(challenge.challengerSquad._id);
    await updateSquadStats(challenge.challengedSquad._id);

    // Notify the other manager
    const recipientId = isChallengedManager ? challenge.challengerSquad.manager : challenge.challengedSquad.manager;
    await Notification.create({
      user: recipientId,
      title: 'Resultado de Jogo Registado 🏁',
      message: `O resultado do jogo entre ${challenge.challengerSquad.name} e ${challenge.challengedSquad.name} foi registado: ${challengerScore} - ${challengedScore}.`,
      type: 'success',
      link: '/dashboard/squads'
    });

    console.log('✅ Challenge result updated successfully');
    res.json(challenge);
  } catch (err) {
    console.error('❗️ Error updating challenge result:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSquadChallenges = async (req, res) => {
  try {
    const { squadId } = req.params;
    const challenges = await Challenge.find({
      $or: [
        { challengerSquad: squadId },
        { challengedSquad: squadId }
      ],
      status: 'completed'
    })
    .populate('challengerSquad', 'name logo color')
    .populate('challengedSquad', 'name logo color')
    .sort({ date: -1 });

    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
