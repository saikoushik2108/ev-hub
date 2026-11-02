import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      // Socket connected
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinRoom = (roomName) => {
    if (socket && roomName) {
      socket.emit('joinRoom', roomName);
    }
  };

  const leaveRoom = (roomName) => {
    if (socket && roomName) {
      socket.emit('leaveRoom', roomName);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

