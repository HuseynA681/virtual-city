import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Home, ShoppingBag, Swords, MessageSquare, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  const features = [
    { icon: Home, title: 'Own Apartments', desc: 'Customize your own space with furniture' },
    { icon: ShoppingBag, title: 'Marketplace', desc: 'Buy and sell items with other players' },
    { icon: MessageSquare, title: 'Live Chat', desc: 'Real-time chat with the community' },
    { icon: Users, title: 'Join Clans', desc: 'Form groups and compete with others' },
    { icon: Zap, title: 'Earn Coins', desc: 'Complete jobs and quests for rewards' },
    { icon: BarChart3, title: 'Leaderboards', desc: 'Compete and climb the rankings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
        >
          🏙️ Virtual City
        </motion.h1>
        <div className="space-x-4">
          <Link to="/login" className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition">Login</Link>
          <Link to="/register" className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 text-white">
            Welcome to the <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Metaverse</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            A thriving digital city where you can socialize, trade, build, and compete with players worldwide
          </p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
            >
              Join Now 🚀
            </motion.button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-500/50 transition group"
            >
              <feature.icon className="w-12 h-12 mx-auto text-purple-400 mb-4 group-hover:text-pink-500 transition" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
