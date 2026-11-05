const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/resume_analyzer',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_key_super_secure_32_chars_min',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_jwt_secret_key_super_secure_32_chars_min',
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
  NLP_SERVICE_URL: process.env.NLP_SERVICE_URL || 'http://localhost:8000',
  NLP_SERVICE_KEY: process.env.NLP_SERVICE_KEY || 'your_nlp_service_key_here',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = env;

