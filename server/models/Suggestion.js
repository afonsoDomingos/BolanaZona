const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  category: { type: String, enum: ['feature', 'bug', 'design', 'other'], default: 'feature' },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'implemented'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
