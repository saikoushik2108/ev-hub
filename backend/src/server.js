import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { startCronJobs, stopCronJobs } from './utils/cronJobs.js';
import { seedDatabaseIfEmpty } from './utils/seedData.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Auto-seed if database is freshly initialized or empty
    await seedDatabaseIfEmpty();

    // 3. Create HTTP Server
    const httpServer = http.createServer(app);

    // 4. Initialize Socket.IO
    initSocket(httpServer);

    // 5. Start background cron reconciliation
    startCronJobs();

    // 6. Listen on all network interfaces (IPv4 and IPv6)
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`⚡ EV Hub Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🚀 REST API listening on: http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO connected & ready`);
      console.log(`====================================================`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      stopCronJobs();
      httpServer.close(async () => {
        console.log('[Server] HTTP server closed.');
        await closeDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[Server] Fatal Error during server bootstrap:', err);
    process.exit(1);
  }
};

startServer();

