import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';

export const ChatComponent = () => {
  const { messages, onlineUsers, typingUsers, sendMessage, sendTyping, runAdminCommand } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [notice, setNotice] = useState('');
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message) return;

    if (message.startsWith('/')) {
      if (!user?.isAdmin) {
        setNotice('Admin command access required');
        return;
      }

      try {
        const result = await runAdminCommand(message);
        setNotice(result.message || 'Command completed');
        setInput('');
      } catch (error) {
        setNotice(error.response?.data?.error || 'Command failed');
      }
      return;
    }

    sendMessage(message);
    setInput('');
  };

  const handleTyping = () => {
    sendTyping();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
      {/* Chat Area */}
      <div className="lg:col-span-3 flex flex-col rounded-xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {notice && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              {notice}
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.userId === user?.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-white/20'
                  }`}
                >
                  <p className="text-sm font-semibold">{msg.username}</p>
                  <p>{msg.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-400">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/20 p-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none transition"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Online Users */}
      <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 h-fit">
        <h3 className="text-lg font-semibold mb-4">
          🟢 Online ({onlineUsers.length})
        </h3>
        {user?.isAdmin && (
          <div className="mb-4 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-100">
            Commands: /clear, /promote username, /demote username, /ban username, /unban username
          </div>
        )}
        <div className="space-y-2">
          {onlineUsers.map((username, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-2 rounded-lg bg-white/10 text-sm"
            >
              {username}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
