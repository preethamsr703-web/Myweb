const { getDB } = require('../config/db');

// @route GET /api/books
const getBooks = async (req, res) => {
  try {
    const {
      q,
      category,
      academicLevel,
      branch,
      semester,
      subjectCode,
      format,
      featured,
      openAccessOnly,
      sort = 'popular',
      page = 1,
      limit = 24
    } = req.query;

    const query = {};

    if (academicLevel && academicLevel !== 'all') {
      query.academicLevel = academicLevel.toLowerCase();
    }
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (branch && branch !== 'all') {
      query.branch = { $regex: new RegExp(branch, 'i') };
    }
    if (semester && semester !== 'all') {
      query.semester = Number(semester);
    }
    if (subjectCode && subjectCode.trim() !== '') {
      query.subjectCode = { $regex: new RegExp(subjectCode.trim(), 'i') };
    }
    if (format && format !== 'all') {
      query.format = format;
    }
    if (featured === 'true' || featured === true) {
      query.isFeatured = true;
    }
    if (openAccessOnly === 'true' || openAccessOnly === true) {
      query.isOpenAccess = true;
    }

    if (q && q.trim() !== '') {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { author: { $regex: searchRegex } },
        { subjectCode: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const { Book } = getDB();

    const sortOptions = {};
    if (sort === 'popular') sortOptions.readsCount = -1;
    else if (sort === 'rating') sortOptions.rating = -1;
    else if (sort === 'latest') sortOptions.publicationYear = -1;
    else if (sort === 'title') sortOptions.title = 1;
    else sortOptions.readsCount = -1;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skipNum = (pageNum - 1) * limitNum;

    const totalBooks = await Book.countDocuments(query);
    const books = await Book.find(query).sort(sortOptions).skip(skipNum).limit(limitNum);

    res.json({
      success: true,
      total: totalBooks,
      page: pageNum,
      totalPages: Math.ceil(totalBooks / limitNum) || 1,
      count: books.length,
      books
    });
  } catch (err) {
    console.error('getBooks error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve books.', error: err.message });
  }
};

// @route GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const { Book } = getDB();
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found in library registry.' });
    }
    res.json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/books
const createBook = async (req, res) => {
  try {
    const { Book, AuditLog, Category } = getDB();
    const bookData = { ...req.body };

    // Standardize types
    if (bookData.semester) bookData.semester = Number(bookData.semester);
    if (bookData.publicationYear) bookData.publicationYear = Number(bookData.publicationYear);
    if (bookData.isOpenAccess === 'true' || bookData.isOpenAccess === true) bookData.isOpenAccess = true;
    else if (bookData.isOpenAccess === 'false' || bookData.isOpenAccess === false) bookData.isOpenAccess = false;
    if (bookData.isFeatured === 'true' || bookData.isFeatured === true) bookData.isFeatured = true;
    else if (bookData.isFeatured === 'false' || bookData.isFeatured === false) bookData.isFeatured = false;

    // Handle file upload if present
    if (req.file) {
      bookData.fileUrl = `/uploads/${req.file.filename}`;
    }

    const newBook = await Book.create(bookData);

    // Update category count
    if (newBook.category) {
      await Category.findByIdAndUpdate(newBook.category, { $inc: { bookCount: 1 } });
    }

    await AuditLog.create({
      action: 'BOOK_CREATED',
      performedBy: { name: req.user.name, email: req.user.email, role: req.user.role },
      details: `Added new title: "${newBook.title}" by ${newBook.author} [${newBook.category}]`,
      targetId: newBook._id
    });

    res.status(201).json({
      success: true,
      message: `Book "${newBook.title}" successfully cataloged!`,
      book: newBook
    });
  } catch (err) {
    console.error('createBook error:', err);
    res.status(500).json({ success: false, message: 'Failed to create book record.', error: err.message });
  }
};

// @route PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const { Book, AuditLog } = getDB();
    const updateData = { ...req.body };

    if (req.file) {
      updateData.fileUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Book record not found.' });
    }

    await AuditLog.create({
      action: 'BOOK_UPDATED',
      performedBy: { name: req.user.name, email: req.user.email, role: req.user.role },
      details: `Updated title: "${updated.title}"`,
      targetId: updated._id
    });

    res.json({ success: true, message: 'Book details updated successfully.', book: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const { Book, AuditLog } = getDB();
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    await AuditLog.create({
      action: 'BOOK_DELETED',
      performedBy: { name: req.user.name, email: req.user.email, role: req.user.role },
      details: `Removed title: "${deleted.title}"`,
      targetId: deleted._id
    });

    res.json({ success: true, message: `Book "${deleted.title}" deleted from catalog.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/books/:id/read
const recordRead = async (req, res) => {
  try {
    const { Book, User } = getDB();
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $inc: { readsCount: 1 } },
      { new: true }
    );

    // If user is authenticated, update their reading history
    if (req.user && book) {
      const { page = 1, totalPages = book.totalPages || 300 } = req.body;
      const progress = Math.min(100, Math.round((page / totalPages) * 100));

      const existingUser = await User.findById(req.user._id);
      let history = existingUser.readingHistory || [];
      const itemIndex = history.findIndex(h => String(h.bookId) === String(book._id));

      const historyEntry = {
        bookId: String(book._id),
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        category: book.category,
        progress,
        lastReadPage: Number(page),
        totalPages: Number(totalPages),
        lastReadAt: new Date().toISOString()
      };

      if (itemIndex > -1) {
        history[itemIndex] = historyEntry;
      } else {
        history.unshift(historyEntry);
      }

      await User.findByIdAndUpdate(req.user._id, {
        $set: { readingHistory: history },
        $inc: { 'studyStats.hoursSpent': 0.25 }
      });
    }

    res.json({ success: true, readsCount: book ? book.readsCount : 1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/books/:id/favorite
const toggleFavorite = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Please sign in to save books.' });
    }
    const { User } = getDB();
    const bookId = String(req.params.id);
    const user = await User.findById(req.user._id);
    const favorites = user.favorites || [];
    const isFav = favorites.includes(bookId);

    let updatedFavorites;
    if (isFav) {
      updatedFavorites = favorites.filter(id => id !== bookId);
    } else {
      updatedFavorites = [...favorites, bookId];
    }

    await User.findByIdAndUpdate(req.user._id, { $set: { favorites: updatedFavorites } });
    res.json({
      success: true,
      isFavorite: !isFav,
      message: !isFav ? 'Added to your favorites list!' : 'Removed from favorites.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  recordRead,
  toggleFavorite
};
