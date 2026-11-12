const express = require('express');
const router = express.Router();
const { getUserDashboardData, addBookmark, deleteBookmark } = require('../controllers/userDashboardController');
const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getSuggestions,
  submitSuggestion,
  reviewSuggestion
} = require('../controllers/adminDashboardController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

// User Dashboard
router.get('/user', protect, getUserDashboardData);
router.post('/user/bookmark', protect, addBookmark);
router.delete('/user/bookmark/:index', protect, deleteBookmark);

// Admin Dashboard
router.get('/admin/stats', protect, authorize('admin', 'librarian'), getAdminStats);
router.get('/admin/users', protect, authorize('admin'), getAllUsers);
router.put('/admin/users/:id/role', protect, authorize('admin'), updateUserRole);
router.get('/admin/suggestions', protect, authorize('admin', 'librarian'), getSuggestions);
router.post('/admin/suggestions', optionalAuth, submitSuggestion);
router.put('/admin/suggestions/:id', protect, authorize('admin', 'librarian'), reviewSuggestion);

module.exports = router;
