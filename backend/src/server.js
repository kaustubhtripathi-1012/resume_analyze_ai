const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Backend API server running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
  });

  const gracefulShutdown = () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      logger.info('Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

start().catch((err) => {
  logger.error(`Fatal startup error: ${err.message}`);
  process.exit(1);
});

