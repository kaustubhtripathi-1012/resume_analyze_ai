const pino = require('pino');
const env = require('../config/env');

const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport: env.NODE_ENV !== 'production' && env.NODE_ENV !== 'test'
    ? {
        target: 'pino/file',
        options: { destination: 1 } // stdout
      }
    : undefined,
  redact: {
    paths: ['req.headers.authorization', 'password', 'passwordHash', 'rawText', 'resumeText'],
    censor: '[REDACTED]'
  }
});

module.exports = logger;

