const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { runSeed } = require('./data/seedData');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const externalRoutes = require('./routes/externalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Optimization Middleware
app.use(compression());
app.use(cors());

// Helmet with permissive CSP for 3D scripts, CDNs, local video & remote covers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Asset Directories
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Digital Public Library 3D Matrix',
    version: '1.0.0'
  });
});

// Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Boot Server & Seed
const startServer = async () => {
  try {
    await connectDB();
    await runSeed();

    app.listen(PORT, () => {
      console.log(`==================================================================`);
      console.log(`🚀 DIGITAL PUBLIC LIBRARY & MANAGEMENT SYSTEM`);
      console.log(`📡 Server running at http://localhost:${PORT}`);
      console.log(`📚 3D Interactive Library: http://localhost:${PORT}/#explore`);
      console.log(`🎓 VTU Engineering Portal: http://localhost:${PORT}/#vtu`);
      console.log(`📊 Synaptix Dashboard:    http://localhost:${PORT}/#dashboard`);
      console.log(`⚙️  Admin Management:      http://localhost:${PORT}/#admin`);
      console.log(`==================================================================`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
};

startServer();
