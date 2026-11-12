const { getDB } = require('../config/db');

// @route GET /api/dashboard/user
const getUserDashboardData = async (req, res) => {
  try {
    const { User, Book } = getDB();
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Retrieve favorite books objects
    const favoriteIds = user.favorites || [];
    const favoriteBooks = [];
    for (const id of favoriteIds) {
      const b = await Book.findById(id);
      if (b) favoriteBooks.push(b);
    }

    // Retrieve saved books objects
    const savedIds = user.savedBooks || [];
    const savedBooks = [];
    for (const id of savedIds) {
      const b = await Book.findById(id);
      if (b) savedBooks.push(b);
    }

    // Recommended books based on user's branch / level
    const recommendedQuery = {
      $or: [
        { branch: user.branch || 'Computer Science and Engineering' },
        { academicLevel: user.academicLevel ? user.academicLevel.toLowerCase() : 'vtu' }
      ]
    };
    const recommendedBooks = await Book.find(recommendedQuery).limit(6);

    const dashboardData = {
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        academicLevel: user.academicLevel || 'VTU Engineering',
        branch: user.branch || 'Computer Science and Engineering',
        semester: user.semester || 5
      },
      metrics: {
        studyUsage: user.studyStats?.hoursSpent ? `${user.studyStats.hoursSpent}h` : '24.5h',
        studyUsageChange: '+12.5% this month',
        outputsCount: user.studyStats?.booksCompleted ? `${user.studyStats.booksCompleted * 102}` : '1,847',
        outputsChange: '+8.2% this month',
        precisionRate: user.studyStats?.comprehensionRate ? `${user.studyStats.comprehensionRate}%` : '98.5%',
        precisionChange: '+2.1% this month',
        activeCourses: user.studyStats?.activeCourses || 12,
        performanceIndexTotal: '$64,345',
        performanceIndexChange: '+14.3%'
      },
      chartData: {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        performanceScores: [42, 54, 60, 58, 48, 62, 85, 74, 68, 52, 64, 78],
        usageData: [18, 22, 28, 26, 31, 35, 42, 38, 44, 40, 48, 52],
        precisionGauge: 98.5
      },
      readingHistory: user.readingHistory || [],
      favorites: favoriteBooks,
      savedBooks: savedBooks,
      bookmarks: user.bookmarks || [],
      recommendedBooks: recommendedBooks
    };

    res.json({ success: true, data: dashboardData });
  } catch (err) {
    console.error('User dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load user dashboard.', error: err.message });
  }
};

// @route POST /api/dashboard/user/bookmark
const addBookmark = async (req, res) => {
  try {
    const { bookId, title, page, note } = req.body;
    const { User } = getDB();
    const bookmark = {
      bookId,
      title: title || 'Bookmark',
      page: Number(page) || 1,
      note: note || '',
      createdAt: new Date().toISOString()
    };

    const user = await User.findById(req.user._id);
    const bookmarks = user.bookmarks || [];
    bookmarks.unshift(bookmark);

    await User.findByIdAndUpdate(req.user._id, { $set: { bookmarks } });
    res.json({ success: true, message: 'Bookmark saved!', bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/dashboard/user/bookmark/:index
const deleteBookmark = async (req, res) => {
  try {
    const { User } = getDB();
    const index = parseInt(req.params.index, 10);
    const user = await User.findById(req.user._id);
    const bookmarks = user.bookmarks || [];
    if (index >= 0 && index < bookmarks.length) {
      bookmarks.splice(index, 1);
      await User.findByIdAndUpdate(req.user._id, { $set: { bookmarks } });
    }
    res.json({ success: true, message: 'Bookmark removed.', bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getUserDashboardData,
  addBookmark,
  deleteBookmark
};
