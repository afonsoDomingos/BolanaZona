const Team = require('../models/Team');
const Match = require('../models/Match');

exports.getTalentRanking = async (req, res) => {
  try {
    // Buscar todos os jogos terminados para contar golos por jogador
    const matches = await Match.find({ status: 'finished' });
    
    const playerStats = {};

    matches.forEach(match => {
      if (match.events) {
        match.events.forEach(event => {
          if (event.type === 'goal') {
            const key = event.playerName.trim();
            if (!playerStats[key]) {
              playerStats[key] = { name: key, goals: 0, mvps: 0, tournaments: new Set() };
            }
            playerStats[key].goals += 1;
            playerStats[key].tournaments.add(match.tournament.toString());
          }
        });
      }
    });

    // Converter para array e ordenar
    const ranking = Object.values(playerStats)
      .map(p => ({
        ...p,
        tournamentsCount: p.tournaments.size,
        score: (p.goals * 10) + (p.mvps * 25) // Lógica simples de pontuação
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Top 50 talentos

    res.json(ranking);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
