const Squad = require('../models/Squad');
const Notification = require('../models/Notification');
const Challenge = require('../models/Challenge');

exports.getMySquads = async (req, res) => {
  try {
    const squads = await Squad.find({ manager: req.user._id }).sort('-createdAt');
    res.json(squads);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const squad = await Squad.create({ ...req.body, manager: req.user._id });
    res.status(201).json(squad);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const oldSquad = await Squad.findOne({ _id: req.params.id, manager: req.user._id });
    if (!oldSquad) return res.status(404).json({ message: 'Clube não encontrado ou sem permissão.' });

    const oldName = oldSquad.name;
    const newName = req.body.name;

    const squad = await Squad.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );

    // Se o nome mudou, atualizar as notificações existentes que mencionam o nome antigo
    if (newName && oldName !== newName) {
      console.log(`🔄 [SYNC] Nome do clube mudou de "${oldName}" para "${newName}". A atualizar notificações...`);
      
      // Procurar notificações que contenham o nome antigo no campo 'message'
      const affectedNotifications = await Notification.find({ 
        message: { $regex: oldName, $options: 'i' } 
      });

      if (affectedNotifications.length > 0) {
        for (let notif of affectedNotifications) {
          notif.message = notif.message.split(oldName).join(newName);
          await notif.save();
        }
        console.log(`✅ [SYNC] ${affectedNotifications.length} notificações atualizadas.`);
      }
    }

    res.json(squad);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const squad = await Squad.findOneAndDelete({ _id: req.params.id, manager: req.user._id });
    if (!squad) return res.status(404).json({ message: 'Clube não encontrado.' });
    res.json({ message: 'Clube eliminado.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPublicSquad = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id).populate('manager', 'name');
    if (!squad) return res.status(404).json({ message: 'Clube não encontrado.' });
    res.json(squad);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllPublicSquads = async (req, res) => {
  try {
    const squads = await Squad.find().populate('manager', 'name').sort('-createdAt');
    res.json(squads);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.recalculateAllStats = async (req, res) => {
  try {
    console.log('🔄 [SYNC] Recalculating stats for all squads...');
    const squads = await Squad.find({});
    let updatedCount = 0;

    for (const squad of squads) {
      const squadId = squad._id;
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
      updatedCount++;
    }

    console.log(`✅ [SYNC] Stats recalculated for ${updatedCount} squads.`);
    res.json({ message: `Successfully recalculated stats for ${updatedCount} squads.` });
  } catch (err) {
    console.error('❌ Error during recalculation:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.sendTwilioSummons = async (req, res) => {
  try {
    const { recipients, templateText, matchInfo } = req.body;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: 'Nenhum destinatário fornecido.' });
    }

    if (!accountSid || !authToken) {
      return res.status(400).json({ 
        configured: false,
        message: 'A API do Twilio não está configurada no servidor (TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN ausentes no .env). Por favor, use o Envio Coletivo Assistido.'
      });
    }

    const axios = require('axios');
    const results = [];
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    for (const player of recipients) {
      if (!player.contact) {
        results.push({ name: player.name, success: false, error: 'Sem número' });
        continue;
      }

      let cleanPhone = player.contact.replace(/\D/g, '');
      if (cleanPhone.length === 9 && (cleanPhone.startsWith('82') || cleanPhone.startsWith('83') || cleanPhone.startsWith('84') || cleanPhone.startsWith('85') || cleanPhone.startsWith('86') || cleanPhone.startsWith('87'))) {
        cleanPhone = '258' + cleanPhone;
      }
      const toWhatsApp = `whatsapp:+${cleanPhone}`;

      let personalizedMsg = templateText || '';
      personalizedMsg = personalizedMsg.split('{Nome do Jogador}').join(player.name || 'Jogador');
      personalizedMsg = personalizedMsg.split('{Equipa Casa}').join(matchInfo?.homeTeam || 'Equipa A');
      personalizedMsg = personalizedMsg.split('{Equipa Visitante}').join(matchInfo?.awayTeam || 'Equipa B');
      personalizedMsg = personalizedMsg.split('{Data}').join(matchInfo?.date || 'A definir');
      personalizedMsg = personalizedMsg.split('{Hora}').join(matchInfo?.time || 'A definir');
      personalizedMsg = personalizedMsg.split('{Local}').join(matchInfo?.location || 'Campo');
      personalizedMsg = personalizedMsg.split('{Link do Jogo}').join(matchInfo?.link || 'https://bolanazona.com');


      try {
        const params = new URLSearchParams();
        params.append('From', fromPhone.startsWith('whatsapp:') ? fromPhone : `whatsapp:${fromPhone}`);
        params.append('To', toWhatsApp);
        params.append('Body', personalizedMsg);

        const twilioRes = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          params.toString(),
          {
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        results.push({ name: player.name, phone: cleanPhone, success: true, sid: twilioRes.data.sid });
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        results.push({ name: player.name, phone: cleanPhone, success: false, error: errMsg });
      }
    }

    res.json({ configured: true, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

