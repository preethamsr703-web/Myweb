const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'librarian', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  academicLevel: {
    type: String,
    default: 'VTU Engineering'
  },
  branch: {
    type: String,
    default: 'Computer Science and Engineering'
  },
  semester: {
    type: Number,
    default: 5
  },
  savedBooks: [{
    type: String
  }],
  favorites: [{
    type: String
  }],
  bookmarks: [{
    bookId: String,
    title: String,
    page: Number,
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  readingHistory: [{
    bookId: String,
    title: String,
    author: String,
    coverImage: String,
    category: String,
    progress: Number,
    lastReadPage: Number,
    totalPages: Number,
    lastReadAt: {
      type: Date,
      default: Date.now
    }
  }],
  studyStats: {
    hoursSpent: { type: Number, default: 24.5 },
    booksCompleted: { type: Number, default: 18 },
    comprehensionRate: { type: Number, default: 98.5 },
    activeCourses: { type: Number, default: 12 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
