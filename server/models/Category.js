const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  group: {
    type: String,
    enum: ['vtu', 'puc', 'school', 'science', 'general', 'exams'],
    default: 'general'
  },
  icon: {
    type: String,
    default: 'book'
  },
  gradient: {
    type: String,
    default: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
  },
  description: {
    type: String,
    default: ''
  },
  bookCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
