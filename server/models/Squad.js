const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: Number },
  position: { type: String, enum: ['GK', 'DEF', 'MID', 'FWD', ''], default: '' },
  isCaptain: { type: Boolean, default: false }
});

const squadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  neighborhood: { type: String, default: '' },
  players: [playerSchema],
  color: { type: String, default: '#00C853' },
  logo: { type: String, default: '' },
  stats: {
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    tournamentsWon: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Squad', squadSchema);
