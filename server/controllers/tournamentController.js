const Team = require('../models/Team');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const SponsorProposal = require('../models/SponsorProposal');
const Subscriber = require('../models/Subscriber');
const { create: createNotification } = require('./notificationController');

// GET /api/tournaments
exports.getAll = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tournaments/:id
exports.getOne = async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('winner', 'name logo color');
    
    if (!t) return res.status(404).json({ message: 'Torneio não encontrado.' });

    const teams = await Team.find({ tournament: t._id });
    const matches = await Match.find({ tournament: t._id })
      .populate('homeTeam', 'name color logo')
      .populate('awayTeam', 'name color logo')
      .sort({ round: 1, date: 1 });

    res.json({ tournament: t, teams, matches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tournaments/public/:shareCode
exports.getPublic = async (req, res) => {
  try {
    const t = await Tournament.findOne({ shareCode: req.params.shareCode })
      .populate('winner', 'name logo color');
    if (!t) return res.status(404).json({ message: 'Torneio não encontrado.' });
    const teams = await Team.find({ tournament: t._id });
    const matches = await Match.find({ tournament: t._id })
      .populate('homeTeam', 'name color logo')
      .populate('awayTeam', 'name color logo')
      .sort({ round: 1, date: 1 });
    const standings = computeStandings(teams, matches);
    res.json({ tournament: t, teams, matches, standings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPublicTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({ 
      status: { $in: ['registration', 'active'] } 
    }).sort('-createdAt');
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tournaments
exports.create = async (req, res) => {
  try {
    const tournament = await Tournament.create({ ...req.body, createdBy: req.user._id });
    
    // Promoção automática: se o utilizador não for admin/superadmin, torna-se admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      await User.findByIdAndUpdate(req.user._id, { role: 'admin' });
      console.log(`🚀 Utilizador ${req.user.name} promovido a ORGANIZADOR (admin) por criar um torneio.`);
    }

    await createNotification(
      req.user._id,
      'Torneio Criado 🏆',
      `O teu torneio "${tournament.name}" foi criado com sucesso. Agora és um ORGANIZADOR!`,
      'success',
      `/dashboard/tournaments/${tournament._id}`
    );
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/tournaments/:id
exports.update = async (req, res) => {
  try {
    const t = await Tournament.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body, { new: true }
    );
    if (!t) return res.status(404).json({ message: 'Torneio não encontrado.' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/tournaments/:id
exports.remove = async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Torneio não encontrado.' });

    // Se o torneio terminou, apenas admins podem apagar
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    if (t.status === 'finished' && !isAdmin) {
      return res.status(403).json({ message: 'Apenas o Administrador pode eliminar torneios finalizados (histórico).' });
    }

    // Garantir que quem apaga é o dono ou um admin
    if (t.createdBy.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ message: 'Não tens permissão para eliminar este torneio.' });
    }

    await Tournament.findByIdAndDelete(req.params.id);
    await Team.deleteMany({ tournament: req.params.id });
    await Match.deleteMany({ tournament: req.params.id });
    await SponsorProposal.deleteMany({ tournament: req.params.id });
    await Subscriber.deleteMany({ tournament: req.params.id });
    res.json({ message: 'Torneio eliminado.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tournaments/:id/generate-calendar
exports.generateCalendar = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Torneio não encontrado.' });
    const teams = await Team.find({ tournament: tournament._id });
    if (teams.length < 2) return res.status(400).json({ message: 'São necessárias pelo menos 2 equipas.' });

    // Remove existing matches
    await Match.deleteMany({ tournament: tournament._id });

    const matches = [];
    const { startDate } = req.body;
    let currentDate = startDate ? new Date(startDate) : new Date();

    if (tournament.format === 'groups' || tournament.format === 'groups_knockout') {
      // Round Robin
      const schedule = generateRoundRobin(teams);
      schedule.forEach((round, roundIdx) => {
        const roundDate = new Date(currentDate);
        roundDate.setDate(roundDate.getDate() + roundIdx * 7);
        round.forEach(match => {
          matches.push({
            tournament: tournament._id,
            homeTeam: match[0]._id,
            awayTeam: match[1]._id,
            round: roundIdx + 1,
            roundName: `Ronda ${roundIdx + 1}`,
            phase: 'group',
            date: roundDate,
            location: tournament.location,
            status: 'scheduled',
          });
        });
      });
    } else {
      // Knockout bracket
      const shuffled = [...teams].sort(() => Math.random() - 0.5);
      let roundTeams = shuffled;
      let roundNum = 1;
      const roundNames = ['Fase de Grupos', 'Oitavos', 'Quartos de Final', 'Meias-Final', 'Final'];
      while (roundTeams.length > 1) {
        const roundDate = new Date(currentDate);
        roundDate.setDate(roundDate.getDate() + (roundNum - 1) * 7);
        for (let i = 0; i < roundTeams.length; i += 2) {
          if (roundTeams[i + 1]) {
            matches.push({
              tournament: tournament._id,
              homeTeam: roundTeams[i]._id,
              awayTeam: roundTeams[i + 1]._id,
              round: roundNum,
              roundName: roundNames[roundNum] || `Ronda ${roundNum}`,
              phase: 'knockout',
              date: roundDate,
              location: tournament.location,
              status: 'scheduled',
            });
          }
        }
        roundTeams = roundTeams.filter((_, i) => i % 2 === 0).slice(0, Math.floor(roundTeams.length / 2));
        roundNum++;
      }
    }

    const created = await Match.insertMany(matches);
    await createNotification(
      req.user._id,
      'Calendário Gerado 📅',
      `Foram gerados ${created.length} jogos para o torneio "${tournament.name}".`,
      'info',
      `/dashboard/tournaments/${tournament._id}`
    );
    res.status(201).json({ message: `${created.length} jogos gerados.`, matches: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tournaments/:id/standings
exports.getStandings = async (req, res) => {
  try {
    const teams = await Team.find({ tournament: req.params.id });
    const matches = await Match.find({ tournament: req.params.id, status: 'finished' });
    const standings = computeStandings(teams, matches);
    res.json(standings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper: Round Robin
function generateRoundRobin(teams) {
  const n = teams.length % 2 === 0 ? teams.length : teams.length + 1;
  const rounds = [];
  const list = [...teams];
  if (teams.length % 2 !== 0) list.push(null); // bye
  for (let r = 0; r < n - 1; r++) {
    const round = [];
    for (let i = 0; i < n / 2; i++) {
      if (list[i] && list[n - 1 - i]) round.push([list[i], list[n - 1 - i]]);
    }
    rounds.push(round);
    list.splice(1, 0, list.pop());
  }
  return rounds;
}

// Helper: Compute Standings
function computeStandings(teams, matches) {
  const table = {};
  teams.forEach(t => {
    table[t._id] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
  });
  matches.filter(m => m.status === 'finished' && m.homeScore !== null).forEach(m => {
    const h = table[m.homeTeam._id || m.homeTeam];
    const a = table[m.awayTeam._id || m.awayTeam];
    if (!h || !a) return;
    h.played++; a.played++;
    h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore;
    a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore) { h.won++; h.points += 3; a.lost++; }
    else if (m.homeScore < m.awayScore) { a.won++; a.points += 3; h.lost++; }
    else { h.drawn++; h.points++; a.drawn++; a.points++; }
  });
  return Object.values(table).sort((a, b) =>
    b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor
  );
}

exports.createMatch = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Torneio não encontrado.' });
    const match = await Match.create({ ...req.body, tournament: tournament._id, status: 'scheduled' });
    res.status(201).json(match);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.removeMatch = async (req, res) => {
  try {
    await Match.findByIdAndDelete(req.params.matchId);
    res.json({ message: 'Jogo removido.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
