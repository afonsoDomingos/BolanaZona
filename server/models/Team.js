const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: Number },
  position: { type: String, enum: ['GK', 'DEF', 'MID', 'FWD', ''], default: '' },
});

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  captainName: { type: String, default: '' },
  contact: { type: String, default: '' },
  players: [playerSchema],
  color: { type: String, default: '#00C853' },
  logo: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
