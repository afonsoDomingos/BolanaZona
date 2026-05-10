const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  round: { type: Number, required: true },
  roundName: { type: String, default: '' }, // e.g. "Ronda 1", "Quartos de Final"
  phase: { type: String, enum: ['group', 'knockout'], default: 'group' },
  group: { type: String, default: '' }, // e.g. "A", "B"
  date: { type: Date },
  location: { type: String, default: '' },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  status: { type: String, enum: ['scheduled', 'live', 'finished', 'postponed'], default: 'scheduled' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
