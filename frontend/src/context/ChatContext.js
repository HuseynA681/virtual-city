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
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to chat:', newSocket.id);
        newSocket.emit('join-chat');
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
      });

      newSocket.on('receive-message', (data) => {
        console.log('📨 Message:', data);
        setMessages(prev => [...prev, data]);
      });

      newSocket.on('chat-cleared', () => {
        setMessages([]);
      });

      newSocket.on('user-joined', (data) => {
        setOnlineUsers(prev => [...new Set([...prev, data.username])]);
      });

      newSocket.on('user-left', (data) => {
        setOnlineUsers(prev => prev.filter(u => u !== data.username));
      });

      newSocket.on('user-typing', (data) => {
        setTypingUsers(prev => [...new Set([...prev, data.username])]);
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== data.username));
        }, 2000);
      });

      newSocket.on('user-banned', (data) => {
        console.log('🚫 User banned:', data);
        setOnlineUsers(prev => prev.filter(u => u !== data.username));
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
