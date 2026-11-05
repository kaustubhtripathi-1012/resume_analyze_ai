const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let isConnected = false;

async function connectDB(retries = 5, delay = 5000) {
  if (isConnected) return;

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      isConnected = true;
      logger.info('Connected to MongoDB successfully');
      return;
    } catch (err) {
      logger.error(`MongoDB connection failed (attempt ${i + 1}/${retries}): ${err.message}`);
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  logger.error('Could not connect to MongoDB after maximum retries');
  if (env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = { connectDB, disconnectDB };

