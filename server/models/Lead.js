const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Opcional se for torneio
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }, // Novo campo
  name: { type: String, required: true },
  contact: { type: String, required: true }, // WhatsApp ou Email
  teamName: { type: String }, // Nome da equipa pretendida
  size: { type: String }, // Tamanho do produto
  color: { type: String }, // Cor do produto
  province: { type: String }, // Província do lead
  quantity: { type: Number, default: 1 }, // Quantidade encomendada
  message: { type: String },
  status: { type: String, enum: ['new', 'contacted', 'converted', 'lost'], default: 'new' },
  source: { type: String, default: 'store' }, // 'store' ou 'tournament_reg'
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
