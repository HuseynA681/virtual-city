import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Users, TrendingUp, BarChart3, Ban, Trash2, UserPlus, UserMinus, RotateCcw } from 'lucide-react';

export const AdminPanelComponent = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const banUser = async (userId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/admin/ban/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to ban user');
    }
  };

  const adminAction = async (action, userId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/admin/${action}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      if (activeTab === 'stats') fetchStats();
    } catch (error) {
      alert(error.response?.data?.error || `Failed to ${action} user`);
    }
  };

  const clearChat = async () => {
    if (!window.confirm('Clear global chat messages?')) return;

    try {
      await axios.delete('http://localhost:5000/api/admin/chat/global', {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Global chat cleared');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to clear chat');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
        {['stats', 'users', 'moderation'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${
              activeTab === tab
                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Statistics */}
      {activeTab === 'stats' && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
          <StatCard icon={TrendingUp} label="Active Today" value={stats.activeUsers} />
          <StatCard icon={BarChart3} label="Total Clans" value={stats.totalClans} />
          <StatCard icon={Ban} label="Banned Users" value={stats.bannedUsers} color="red" />
        </motion.div>
      )}

      {/* Users Management */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden"
        >
          <table className="w-full">
            <thead className="border-b border-white/20 bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Level</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-3">{user.username}</td>
                  <td className="px-6 py-3 text-gray-400">{user.email}</td>
                  <td className="px-6 py-3">{user.level}</td>
                  <td className="px-6 py-3">
                    {user.isAdmin ? (
                      <span className="mr-2 px-2 py-1 rounded bg-purple-500/20 text-purple-200 text-xs font-semibold">
                        Admin
                      </span>
                    ) : null}
                    {user.isBanned ? (
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-xs font-semibold">
                        Banned
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs font-semibold">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      {user.isAdmin ? (
                        <button
                          onClick={() => adminAction('demote', user._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-semibold bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 transition"
                        >
                          <UserMinus className="w-4 h-4" />
                          Demote
                        </button>
                      ) : (
                        <button
                          onClick={() => adminAction('promote', user._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 transition"
                        >
                          <UserPlus className="w-4 h-4" />
                          Promote
                        </button>
                      )}
                      {user.isBanned ? (
                        <button
                          onClick={() => adminAction('unban', user._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-semibold bg-green-500/20 hover:bg-green-500/30 text-green-300 transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => banUser(user._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
                        >
                          <Ban className="w-4 h-4" />
                          Ban
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Moderation */}
      {activeTab === 'moderation' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
        >
          <h2 className="text-xl font-bold mb-4">Moderation Tools</h2>
          <div className="flex flex-wrap gap-3">
                    <button
              onClick={clearChat}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 font-semibold transition"
                    >
              <Trash2 className="w-5 h-5" />
              Clear Global Chat
                    </button>
          </div>
          <div className="mt-6 rounded-lg border border-purple-500/30 bg-purple-500/10 p-4 text-sm text-purple-100">
            Chat commands: /clear, /promote username, /demote username, /ban username, /unban username
          </div>
        </motion.div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color = 'purple' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className={`p-6 rounded-lg bg-gradient-to-br ${
      color === 'red'
        ? 'from-red-600/30 to-red-600/10'
        : 'from-purple-600/30 to-pink-600/10'
    } border ${color === 'red' ? 'border-red-500/30' : 'border-purple-500/30'}`}
  >
    <Icon className="w-8 h-8 mb-2 text-purple-300" />
    <p className="text-gray-400 text-sm">{label}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </motion.div>
);
