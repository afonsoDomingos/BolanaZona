const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['visit', 'click', 'purchase_attempt'], 
    required: true 
  },
  page: { type: String }, // Ex: '/shop', '/talents'
  targetId: { type: String }, // ID do produto ou torneio clicado
  targetName: { type: String }, // Nome do produto ou torneio
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip: { type: String },
  userAgent: { type: String },
  deviceType: { type: String }, // mobile, desktop, tablet
  os: { type: String }, // windows, android, ios, macos, etc
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
