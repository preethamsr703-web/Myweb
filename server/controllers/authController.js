const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', academicLevel, branch, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const { User, AuditLog } = getDB();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: ['student', 'librarian', 'admin'].includes(role) ? role : 'student',
      academicLevel: academicLevel || 'VTU Engineering',
      branch: branch || 'Computer Science and Engineering',
      semester: Number(semester) || 5,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      savedBooks: [],
      favorites: [],
      bookmarks: [],
      readingHistory: [],
      studyStats: {
        hoursSpent: 0,
        booksCompleted: 0,
        comprehensionRate: 95.0,
        activeCourses: 6
      }
    });

    await AuditLog.create({
      action: 'USER_REGISTERED',
      performedBy: { name: user.name, email: user.email, role: user.role },
      details: `New account created: ${user.name} (${user.role})`,
      targetId: user._id
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Digital Public Library.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        academicLevel: user.academicLevel,
        branch: user.branch,
        semester: user.semester,
        studyStats: user.studyStats
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    const { User, AuditLog } = getDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    await AuditLog.create({
      action: 'USER_LOGIN',
      performedBy: { name: user.name, email: user.email, role: user.role },
      details: `User logged in: ${user.email}`,
      targetId: user._id
    });

    const token = generateToken(user);
    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        academicLevel: user.academicLevel,
        branch: user.branch,
        semester: user.semester,
        studyStats: user.studyStats || { hoursSpent: 24.5, booksCompleted: 18, comprehensionRate: 98.5, activeCourses: 12 },
        favorites: user.favorites || [],
        savedBooks: user.savedBooks || [],
        bookmarks: user.bookmarks || []
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const { User } = getDB();
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const safeUser = { ...user };
    delete safeUser.password;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, academicLevel, branch, semester } = req.body;
    const { User } = getDB();
    const updated = await User.findByIdAndUpdate(
      req.user._id || req.user.id,
      {
        $set: {
          ...(name && { name }),
          ...(avatar && { avatar }),
          ...(academicLevel && { academicLevel }),
          ...(branch && { branch }),
          ...(semester && { semester: Number(semester) })
        }
      },
      { new: true }
    );
    const safeUser = { ...updated };
    delete safeUser.password;
    res.json({ success: true, message: 'Profile updated successfully.', user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/auth/quick-demo
const quickDemoLogin = async (req, res) => {
  try {
    const { role = 'student' } = req.body;
    const { User } = getDB();
    let targetEmail;
    if (role === 'admin') targetEmail = 'admin@library.gov.in';
    else if (role === 'librarian') targetEmail = 'librarian@library.gov.in';
    else targetEmail = 'alex@student.edu';

    let user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo account not initialized.' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: `Signed in as Demo ${user.role.toUpperCase()}: ${user.name}`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        academicLevel: user.academicLevel,
        branch: user.branch,
        semester: user.semester,
        studyStats: user.studyStats,
        favorites: user.favorites || [],
        savedBooks: user.savedBooks || [],
        bookmarks: user.bookmarks || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  quickDemoLogin
};
