import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { apiUrl, SOCKET_URL } from '../config/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (user && token) {
      console.log('🔌 Initializing socket with SOCKET_URL:', SOCKET_URL);
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['polling', 'websocket'],
        upgrade: true,
        rememberUpgrade: true,
        reconnection: true,
        reconnectionDelay: 100,
        reconnectionDelayMax: 3000,
        reconnectionAttempts: Infinity,
        timeout: 20000
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to chat', newSocket.id, 'via', newSocket.io.engine.transport.name);
        newSocket.emit('join-chat', { userId: user.id, username: user.username });
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });

      newSocket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔴 Disconnected from chat:', reason);
      });

      newSocket.on('receive-message', (data) => {
        console.log('📨 Message received:', data);
        setMessages(prev => [...prev, data]);
      });

      newSocket.on('chat-cleared', () => {
        setMessages([]);
      });

      newSocket.on('user-joined', (data) => {
        console.log('👤 User joined:', data);
        setOnlineUsers(prev => [...new Set([...prev, data.username])]);
      });

      newSocket.on('user-left', (data) => {
        console.log('👤 User left:', data);
        setOnlineUsers(prev => prev.filter(u => u !== data.username));
      });

      newSocket.on('user-typing', (data) => {
        setTypingUsers(prev => [...new Set([...prev, data.username])]);
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== data.username));
        }, 2000);
      });

      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [user, token]);

  const sendMessage = (message) => {
    if (socket) {
      socket.emit('send-message', { message, avatar: user?.avatar });
    }
  };

  const sendTyping = () => {
    if (socket) {
      socket.emit('typing');
    }
  };

  const runAdminCommand = async (command) => {
    const response = await axios.post(
      apiUrl('/api/admin/command'),
      { command },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (command.trim().toLowerCase().startsWith('/clear')) {
      setMessages([]);
      socket?.emit('chat-cleared');
    }

    return response.data;
  };

  return (
    <ChatContext.Provider value={{ socket, messages, onlineUsers, typingUsers, sendMessage, sendTyping, runAdminCommand }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
