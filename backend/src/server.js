import { startServer, stopServer } from './app.js';

startServer();

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  stopServer();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
