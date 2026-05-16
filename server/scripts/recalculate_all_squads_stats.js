const mongoose = require('mongoose');
require('dotenv').config();
const Squad = require('../models/Squad');
const Challenge = require('../models/Challenge');

async function run() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    const squads = await Squad.find({});
    console.log(`🔍 Found ${squads.length} squads. Recalculating stats...`);

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
      console.log(`⚽ Squad: ${squad.name} -> Matches: ${challenges.length}, Wins: ${wins}, Losses: ${losses}`);
    }

    console.log('🎉 Recalculation completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during recalculation:', err);
    process.exit(1);
  }
}

run();
