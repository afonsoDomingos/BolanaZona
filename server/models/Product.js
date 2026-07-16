const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['camisolas', 'personalizados', 'chuteiras', 'meias', 'trofeus', 'bolas', 'treino'],
    required: true 
  },
  image: { type: String },
  images: { type: [String], default: [] },
  stock: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
