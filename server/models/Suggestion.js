const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  reason: {
    type: String,
    default: ''
  },
  suggestedBy: {
    name: String,
    email: String,
    userId: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Suggestion || mongoose.model('Suggestion', suggestionSchema);
