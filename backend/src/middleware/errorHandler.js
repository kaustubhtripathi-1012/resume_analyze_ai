const logger = require('../utils/logger');
const env = require('../config/env');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  logger.error({
    msg: err.message,
    code: errorCode,
    statusCode,
    url: req.originalUrl,
    method: req.method
  });

  const response = {
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred.'
    }
  };

  if (env.NODE_ENV !== 'production' && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;

