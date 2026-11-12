const { getDB } = require('../config/db');

// @route GET /api/categories
const getCategories = async (req, res) => {
  try {
    const { Category } = getDB();
    const categories = await Category.find().sort({ group: 1, name: 1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCategories
};
