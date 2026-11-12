const mongoose = require('mongoose');
const embedded = require('../data/embedded-db');

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital_public_library';
  try {
    // Attempt connection with 1s server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1000
    });
    isMongoConnected = true;
    console.log(`[DB] Connected to MongoDB database: ${mongoose.connection.name}`);
  } catch (error) {
    isMongoConnected = false;
    console.log(`[DB] MongoDB server not active (${error.message}).`);
    console.log(`[DB] Successfully engaged embedded persistence engine (server/data/store.json). Zero setup required!`);
  }
};

const getDB = () => {
  if (isMongoConnected) {
    return {
      type: 'mongoose',
      User: require('../models/User'),
      Book: require('../models/Book'),
      Category: require('../models/Category'),
      Suggestion: require('../models/Suggestion'),
      AuditLog: require('../models/AuditLog')
    };
  } else {
    return {
      type: 'embedded',
      User: embedded.User,
      Book: embedded.Book,
      Category: embedded.Category,
      Suggestion: embedded.Suggestion,
      AuditLog: embedded.AuditLog
    };
  }
};

module.exports = {
  connectDB,
  getDB,
  isUsingMongo: () => isMongoConnected
};
