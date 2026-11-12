const { getDB } = require('../config/db');

// @route GET /api/dashboard/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const { Book, User, Suggestion, AuditLog } = getDB();

    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const openAccessCount = await Book.countDocuments({ isOpenAccess: true });
    const pendingSuggestions = await Suggestion.countDocuments({ status: 'pending' });

    // Aggregate reads count
    const allBooks = await Book.find();
    const totalReads = allBooks.reduce((sum, b) => sum + (Number(b.readsCount) || 0), 0);

    // Distribution by VTU branch
    const branches = [
      'Computer Science and Engineering',
      'Information Science and Engineering',
      'Artificial Intelligence and Machine Learning',
      'Electronics and Communication Engineering',
      'Electrical and Electronics Engineering',
      'Mechanical Engineering',
      'Civil Engineering'
    ];

    const branchCounts = {};
    for (const br of branches) {
      branchCounts[br] = allBooks.filter(b => b.branch && b.branch.toLowerCase().includes(br.toLowerCase().split(' ')[0])).length;
    }

    // Category counts
    const categoryMap = {};
    allBooks.forEach(b => {
      const cat = b.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(10);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10);

    const stats = {
      overview: {
        totalBooks,
        totalUsers,
        totalReads,
        openAccessCount,
        pendingSuggestions,
        activeRate: '98.5%',
        monthlyUsageK: '24.5K',
        outputsCount: '1,847',
        performanceIndex: '$64,345'
      },
      charts: {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        monthlyReads: [4200, 5800, 7100, 6900, 8400, 9200, 11400, 12800, 14200, 15900, 18400, 24500],
        performanceLine: [40, 52, 63, 61, 55, 68, 88, 76, 70, 56, 68, 82],
        precisionGauge: {
          performance: 24,
          efficiency: 27,
          score: 85
        },
        branchDistribution: branchCounts,
        categoryDistribution: categoryMap
      },
      recentLogs,
      recentUsers: recentUsers.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        academicLevel: u.academicLevel,
        createdAt: u.createdAt
      }))
    };

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.', error: err.message });
  }
};

// @route GET /api/dashboard/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { User } = getDB();
    const users = await User.find().sort({ createdAt: -1 });
    const sanitized = users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    res.json({ success: true, users: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/dashboard/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'librarian', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const { User, AuditLog } = getDB();
    const targetUser = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await AuditLog.create({
      action: 'USER_ROLE_UPDATED',
      performedBy: { name: req.user.name, email: req.user.email, role: req.user.role },
      details: `Changed role for ${targetUser.email} to ${role}`,
      targetId: targetUser._id
    });

    res.json({ success: true, message: `Updated role for ${targetUser.name} to ${role}.`, user: targetUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/dashboard/admin/suggestions
const getSuggestions = async (req, res) => {
  try {
    const { Suggestion } = getDB();
    const suggestions = await Suggestion.find().sort({ createdAt: -1 });
    res.json({ success: true, suggestions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/dashboard/admin/suggestions
const submitSuggestion = async (req, res) => {
  try {
    const { title, author, category, reason } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Book title is required.' });
    }
    const { Suggestion } = getDB();
    const suggestion = await Suggestion.create({
      title,
      author: author || 'Unknown',
      category: category || 'General',
      reason: reason || '',
      suggestedBy: req.user ? { name: req.user.name, email: req.user.email, userId: req.user._id } : { name: 'Guest Reader', email: 'guest@reader.org' }
    });
    res.status(201).json({ success: true, message: 'Book request submitted to the librarian review queue!', suggestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/dashboard/admin/suggestions/:id
const reviewSuggestion = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const { Suggestion, AuditLog } = getDB();
    const suggestion = await Suggestion.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    if (!suggestion) {
      return res.status(404).json({ success: false, message: 'Suggestion not found.' });
    }

    await AuditLog.create({
      action: `SUGGESTION_${status.toUpperCase()}`,
      performedBy: { name: req.user.name, email: req.user.email, role: req.user.role },
      details: `Suggestion "${suggestion.title}" set to ${status}`,
      targetId: suggestion._id
    });

    res.json({ success: true, message: `Suggestion status updated to ${status}.`, suggestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getSuggestions,
  submitSuggestion,
  reviewSuggestion
};
