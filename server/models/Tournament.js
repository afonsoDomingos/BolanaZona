const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  neighborhood: { type: String, default: 'Geral' },
  location: { type: String, default: 'Geral' },
  format: { type: String, enum: ['groups', 'knockout', 'groups_knockout', 'league'], default: 'groups' },
  maxTeams: { type: Number, default: 16, min: 2, max: 128 },
  status: { type: String, enum: ['draft', 'registration', 'active', 'finished'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shareCode: { type: String, unique: true, default: () => uuidv4().substring(0, 8).toUpperCase() },
  startDate: { type: Date },
  endDate: { type: Date },
  prize: { type: String, default: '' },
  province: { type: String, default: 'Maputo Cidade' },
  registrationFee: { type: Number, default: 0 },
  contactLink: { type: String, default: '' },
  allowPublicRegistration: { type: Boolean, default: true },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  mvp: { type: String, default: '' },
  bestScorer: { type: String, default: '' },
  bestGoalkeeper: { type: String, default: '' },
  isOfficial: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);
