const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  subCategory: {
    type: String,
    default: ''
  },
  academicLevel: {
    type: String,
    enum: ['vtu', 'puc', 'sslc', 'diploma', 'science', 'general', 'competitive'],
    default: 'general',
    index: true
  },
  branch: {
    type: String,
    default: '',
    index: true
  },
  semester: {
    type: Number,
    default: null,
    index: true
  },
  subjectCode: {
    type: String,
    default: '',
    index: true
  },
  isbn: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  publicationYear: {
    type: Number,
    default: 2024
  },
  publisher: {
    type: String,
    default: 'Open Educational Resources'
  },
  edition: {
    type: String,
    default: 'Latest CBCS / Revised Edition'
  },
  format: {
    type: String,
    enum: ['PDF', 'EPUB', 'OpenAccess', 'InteractiveReader'],
    default: 'PDF'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  externalSourceUrl: {
    type: String,
    default: ''
  },
  isOpenAccess: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewsCount: {
    type: Number,
    default: 120
  },
  readsCount: {
    type: Number,
    default: 1450
  },
  totalPages: {
    type: Number,
    default: 320
  },
  syllabusLink: {
    type: String,
    default: 'https://vtu.ac.in/en/syllabus/'
  },
  tableOfContents: [{
    chapter: String,
    page: Number
  }],
  sampleContent: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Full-text search index
bookSchema.index({
  title: 'text',
  author: 'text',
  description: 'text',
  subjectCode: 'text',
  category: 'text'
});

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);
