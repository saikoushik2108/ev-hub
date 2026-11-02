import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // Socket middleware for authentication (optional/graceful)
  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'evhub_jwt_super_secret_key_change_in_production_2026!');
        socket.user = decoded;
      } catch (err) {
        // Continue unauthenticated, but socket.user will be undefined
      }
    }
    next();
  });

  ioInstance.on('connection', (socket) => {
    // If authenticated, join user-specific room automatically
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
      if (socket.user.role === 'OWNER') {
        socket.join(`owner:${socket.user.id}`);
      }
      if (socket.user.role === 'ADMIN') {
        socket.join('admin:room');
      }
    }

    // Explicit room subscription
    socket.on('joinRoom', (room) => {
      if (typeof room === 'string' && room.trim()) {
        socket.join(room);
      }
    });

    socket.on('leaveRoom', (room) => {
      if (typeof room === 'string' && room.trim()) {
        socket.leave(room);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  console.log('[Socket.IO] Real-time engine initialized.');
  return ioInstance;
};

export const getIO = () => ioInstance;

export const emitToUser = (userId, event, payload) => {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(event, payload);
  }
};

export const emitToOwner = (ownerId, event, payload) => {
  if (ioInstance && ownerId) {
    ioInstance.to(`owner:${ownerId}`).emit(event, payload);
  }
};

export const emitToStation = (stationId, event, payload) => {
  if (ioInstance && stationId) {
    ioInstance.to(`station:${stationId}`).emit(event, payload);
  }
};

export const emitToAdmin = (event, payload) => {
  if (ioInstance) {
    ioInstance.to('admin:room').emit(event, payload);
  }
};

export const broadcastGlobal = (event, payload) => {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
};

