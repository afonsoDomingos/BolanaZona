const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'score', 'goal'],
    default: 'text'
  },
  content: {
    type: String,
    required: function() { return this.type === 'text'; }
  },
  scoreData: {
    teamA: String,
    teamB: String,
    scoreA: Number,
    scoreB: Number,
    period: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
