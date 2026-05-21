import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ShoppingBag, Home, Users, LogOut, Package, Gamepad2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChatComponent } from '../components/Chat';
import { MarketplaceComponent } from '../components/Marketplace';
import { ApartmentComponent } from '../components/Apartment';
import { ClansComponent } from '../components/Clans';
import { InventoryComponent } from '../components/Inventory';
import { GameAreaComponent } from '../components/GameArea';
import { AdminPanelComponent } from '../components/AdminPanel';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'apartment', label: 'Apartment', icon: Home },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'clans', label: 'Clans', icon: Users },
    ...(['owner', 'co-owner', 'elder'].includes(user?.role) ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white/10 backdrop-blur-md border-r border-white/20 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            🏙️ Virtual City
          </h1>
        </div>

        {/* User Card */}
        <div className="mb-8 p-4 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
          <img src={user?.avatar} alt={user?.username} className="w-16 h-16 rounded-lg mb-4 object-cover" />
          <h2 className="font-semibold text-lg">{user?.username}</h2>
          <p className="text-purple-300 text-sm">Level {user?.level}</p>
          <p className="text-yellow-400 font-semibold mt-2">💰 {user?.coins} coins</p>
          {user?.role === 'owner' && <p className="text-red-400 text-xs font-bold mt-1">👑 OWNER</p>}
          {user?.role === 'co-owner' && <p className="text-yellow-400 text-xs font-bold mt-1">⭐ CO-OWNER</p>}
          {user?.role === 'elder' && <p className="text-blue-400 text-xs font-bold mt-1">🧙 ELDER</p>}
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'home' && <HomeTab user={user} />}
        {activeTab === 'chat' && <ChatComponent />}
        {activeTab === 'marketplace' && <MarketplaceComponent />}
        {activeTab === 'inventory' && <InventoryComponent />}
        {activeTab === 'apartment' && <ApartmentComponent />}
        {activeTab === 'games' && <GameAreaComponent />}
        {activeTab === 'clans' && <ClansComponent />}
        {activeTab === 'admin' && user?.isAdmin && <AdminPanelComponent />}
      </div>
    </div>
  );
};

const HomeTab = ({ user }) => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Stats Cards */}
        <StatCard icon="⭐" label="Level" value={user?.level} />
        <StatCard icon="💰" label="Coins" value={user?.coins} />
        <StatCard icon="🎁" label="Items" value={user?.inventory?.length || 0} />
        <StatCard icon="🏆" label="Achievements" value={user?.achievements?.length || 0} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
      >
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton icon="💼" label="Work Job" desc="Earn 100 coins" />
          <ActionButton icon="🎮" label="Play Game" desc="Earn items" />
          <ActionButton icon="📜" label="Daily Quest" desc="Bonus rewards" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
      >
        <h2 className="text-2xl font-bold mb-6">📰 Recent Activity</h2>
        <div className="space-y-3">
          <ActivityItem icon="✨" text="Joined Virtual City" time="5 mins ago" />
          <ActivityItem icon="💰" text="Earned 100 coins" time="10 mins ago" />
          <ActivityItem icon="🛍️" text="Purchased furniture" time="1 hour ago" />
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-6 rounded-lg bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/50 backdrop-blur-sm"
  >
    <div className="text-3xl mb-2">{icon}</div>
    <p className="text-gray-400">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </motion.div>
);

const ActionButton = ({ icon, label, desc }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    className="p-4 rounded-lg bg-white/10 border border-white/20 hover:border-purple-500/50 transition text-left"
  >
    <div className="text-3xl mb-2">{icon}</div>
    <p className="font-semibold">{label}</p>
    <p className="text-sm text-gray-400">{desc}</p>
  </motion.button>
);

const ActivityItem = ({ icon, text, time }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
  >
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <span>{text}</span>
    </div>
    <span className="text-xs text-gray-500">{time}</span>
  </motion.div>
);
