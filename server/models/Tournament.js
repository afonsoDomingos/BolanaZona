const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  neighborhood: { type: String, required: true },
  location: { type: String, required: true },
  format: { type: String, enum: ['groups', 'knockout', 'groups_knockout'], required: true },
  maxTeams: { type: Number, required: true, min: 2, max: 32 },
  status: { type: String, enum: ['draft', 'registration', 'active', 'finished'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shareCode: { type: String, unique: true, default: () => uuidv4().substring(0, 8).toUpperCase() },
  startDate: { type: Date },
  endDate: { type: Date },
  prize: { type: String, default: '' },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
