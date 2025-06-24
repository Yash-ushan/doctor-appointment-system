import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('Connected to server');
        // Join user room for notifications
        if (user) {
          newSocket.emit('join_room', { room: user.id });
        }
      });

      // Listen for appointment notifications
      newSocket.on('appointment_notification', (data) => {
        setNotifications(prev => [...prev, data]);
        
        switch (data.type) {
          case 'new_appointment':
            toast.success('New appointment booked!');
            break;
          case 'status_update':
            toast.info(`Appointment ${data.status}`);
            break;
          default:
            toast.info('New notification');
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const joinChatRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', { room: roomId });
    }
  };

  const sendMessage = (roomId, message) => {
    if (socket) {
      socket.emit('send_message', {
        room: roomId,
        message,
        sender: user?.id,
        senderRole: user?.role,
        timestamp: new Date()
      });
    }
  };

  const value = {
    socket,
    notifications,
    joinChatRoom,
    sendMessage,
    setNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};