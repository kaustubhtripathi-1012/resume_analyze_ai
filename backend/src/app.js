const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const env = require('./config/env');

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const analysisRoutes = require('./routes/analyses');
const jobRoutes = require('./routes/jobs');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow frontend origin
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging (skip during automated test runs)
if (env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}

// Global rate limiter: 100 requests / minute
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after a minute.'
    }
  }
});
app.use('/api', globalLimiter);

// Auth rate limiter: 10 attempts / minute
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again in a minute.'
    }
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Central error handler
app.use(errorHandler);

module.exports = app;

