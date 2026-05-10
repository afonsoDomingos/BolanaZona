const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true }, // WhatsApp ou Email
  message: { type: String },
  status: { type: String, enum: ['new', 'contacted', 'sold', 'lost'], default: 'new' },
  source: { type: String, default: 'store' },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
