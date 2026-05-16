const Team = require('../models/Team');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');


exports.getTalentRanking = async (req, res) => {
  try {
    // Buscar todos os jogos terminados para contar golos por jogador
    const matches = await Match.find({ status: 'finished' });
    
    // Buscar torneios finalizados para contar prémios individuais
    const tournaments = await Tournament.find({ status: 'finished' });
    
    const playerStats = {};

    // Processar golos dos eventos de jogos
    matches.forEach(match => {
      if (match.events) {
        match.events.forEach(event => {
          if (event.type === 'goal') {
            const key = event.playerName.trim();
            if (!playerStats[key]) {
              playerStats[key] = { name: key, goals: 0, mvps: 0, awards: 0, tournaments: new Set() };
            }
            playerStats[key].goals += 1;
            playerStats[key].tournaments.add(match.tournament.toString());
          }
        });
      }
    });

    // Processar prémios dos torneios
    tournaments.forEach(t => {
      if (t.mvp) {
        const name = t.mvp.trim();
        if (!playerStats[name]) playerStats[name] = { name, goals: 0, mvps: 0, awards: 0, tournaments: new Set() };
        playerStats[name].mvps += 1;
        playerStats[name].awards += 1;
      }
      if (t.bestScorer) {
        const name = t.bestScorer.trim();
        if (!playerStats[name]) playerStats[name] = { name, goals: 0, mvps: 0, awards: 0, tournaments: new Set() };
        playerStats[name].awards += 1;
      }
      if (t.bestGoalkeeper) {
        const name = t.bestGoalkeeper.trim();
        if (!playerStats[name]) playerStats[name] = { name, goals: 0, mvps: 0, awards: 0, tournaments: new Set() };
        playerStats[name].awards += 1;
      }
    });

    // Converter para array e ordenar
    const ranking = Object.values(playerStats)
      .map(p => ({
        ...p,
        tournamentsCount: p.tournaments.size,
        // Score: Golos (10 pts) + MVPs (50 pts) + Outros Prémios (30 pts)
        score: (p.goals * 10) + (p.mvps * 50) + (p.awards * 30)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Top 50 talentos

    res.json(ranking);

  } catch (err) { res.status(500).json({ message: err.message }); }
};
