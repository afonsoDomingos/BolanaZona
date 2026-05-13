const Challenge = require('../models/Challenge');
const Squad = require('../models/Squad');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.create = async (req, res) => {
  console.log('⚡️ Creating challenge - payload:', req.body, 'user:', req.user._id);
  try {
    const { challengerSquad, challengedSquad, date, location, message, type, wagerValue } = req.body;

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

    const challenge = await Challenge.create({ challengerSquad, challengedSquad, date, location, message, type, wagerValue });
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
      .populate('challengerSquad', 'name logo color manager')
      .populate('challengedSquad', 'name logo color manager')
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
    const { status } = req.body;
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
    await challenge.save();
    console.log('✅ Challenge status updated to', status);

    let whatsappLink = null;
    const recipientPhone = (challenge.challengerSquad.contact || challenge.challengerSquad.manager?.phone || '').replace(/\D/g, '');
    
    if (recipientPhone && isChallengedManager) {
      if (status === 'accepted') {
        const waMessage = `⚔️ *DESAFIO ACEITE!* ⚔️\n\nOlá, a equipa *${challenge.challengedSquad.name}* acaba de aceitar o vosso desafio no Bola na Zona! 🔥\n\nVamos fechar os detalhes do jogo?`;
        whatsappLink = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(waMessage)}`;
      } else if (status === 'rejected') {
        const waMessage = `Olá! A equipa *${challenge.challengedSquad.name}* não pode aceitar o vosso desafio neste momento. Fica para a próxima! ⚽`;
        whatsappLink = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(waMessage)}`;
      }
    }

    // Create Internal Notification for the challenger manager
    await Notification.create({
      user: challenge.challengerSquad.manager,
      title: status === 'accepted' ? 'Desafio Aceite! 🔥' : 'Desafio Recusado ❌',
      message: `A equipa ${challenge.challengedSquad.name} ${status === 'accepted' ? 'aceitou' : 'recusou'} o vosso desafio.`,
      type: status === 'accepted' ? 'success' : 'warning',
      link: '/dashboard/squads'
    });

    res.json({ challenge, whatsappLink });
  } catch (err) {
    console.error('❗️ Error updating challenge status:', err);
    res.status(500).json({ message: err.message });
  }
};
