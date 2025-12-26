import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};


