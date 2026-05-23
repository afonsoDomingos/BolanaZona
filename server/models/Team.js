const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: Number },
  position: { type: String, enum: ['GK', 'DEF', 'MID', 'FWD', ''], default: '' },
  photo: { type: String, default: '' },
});

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  captains: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  captainName: { type: String, default: '' },
  coachName: { type: String, default: '' },
  contact: { type: String, default: '' },
  players: [playerSchema],
  color: { type: String, default: '#00C853' },
  logo: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  amountPaid: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invitationCode: { type: String, unique: true, sparse: true },
}, { timestamps: true });


module.exports = mongoose.model('Team', teamSchema);
