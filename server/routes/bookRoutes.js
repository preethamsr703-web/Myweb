const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  recordRead,
  toggleFavorite
} = require('../controllers/bookController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'book-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.epub', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, EPUB, and image files (JPG, PNG, WEBP) are supported.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter
});

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', protect, authorize('admin', 'librarian'), upload.single('bookFile'), createBook);
router.put('/:id', protect, authorize('admin', 'librarian'), upload.single('bookFile'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);
router.post('/:id/read', optionalAuth, recordRead);
router.post('/:id/favorite', protect, toggleFavorite);

module.exports = router;
