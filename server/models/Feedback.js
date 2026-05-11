const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  experience: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['social_media', 'friends', 'tournament', 'google', 'other'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  ip: String
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
