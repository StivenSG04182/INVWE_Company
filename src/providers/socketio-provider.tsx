"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Cambia la URL si tu endpoint es diferente
const SOCKET_URL = "/api/socketio";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Solo conectar en el cliente y si no hay una conexión existente
    if (typeof window !== 'undefined' && !socketRef.current) {
      try {
        console.log('🔌 SocketProvider - Attempting to connect to Socket.IO');
        
        const socketIo = io(SOCKET_URL, {
          path: "/api/socketio",
          transports: ["websocket", "polling"], // Fallback a polling si websocket falla
          timeout: 5000, // Timeout de 5 segundos
          forceNew: true,
        });

        socketIo.on('connect', () => {
          console.log('🔌 SocketProvider - Connected successfully');
          setIsConnected(true);
        });

        socketIo.on('connect_error', (error) => {
          console.error('🔌 SocketProvider - Connection error:', error);
          setIsConnected(false);
        });

        socketIo.on('disconnect', (reason) => {
          console.log('🔌 SocketProvider - Disconnected:', reason);
          setIsConnected(false);
        });

        socketRef.current = socketIo;
        setSocket(socketIo);
      } catch (error) {
        console.error('🔌 SocketProvider - Error creating socket connection:', error);
        setIsConnected(false);
      }
    }

    return () => {
      if (socketRef.current) {
        console.log('🔌 SocketProvider - Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}; 