const mongoose = require('mongoose');

const sponsorProposalSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'read', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('SponsorProposal', sponsorProposalSchema);
