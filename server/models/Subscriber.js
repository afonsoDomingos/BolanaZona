const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Garantir que um número só segue o mesmo torneio uma vez
subscriberSchema.index({ tournament: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);
