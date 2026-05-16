const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  challengerSquad: { type: mongoose.Schema.Types.ObjectId, ref: 'Squad', required: true },
  challengedSquad: { type: mongoose.Schema.Types.ObjectId, ref: 'Squad', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  date: { type: Date },
  location: { type: String, default: '' },
  mapsLink: { type: String, default: '' },
  message: { type: String, default: '' },
  type: { type: String, enum: ['friendly', 'wager'], default: 'friendly' },
  wagerValue: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  result: {
    challengerScore: { type: Number, default: 0 },
    challengedScore: { type: Number, default: 0 },
    confirmed: { type: Boolean, default: false },
    scorers: [
      {
        playerName: { type: String, required: true },
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Squad', required: true },
        goals: { type: Number, default: 1 }
      }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
