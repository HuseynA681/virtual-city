import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';

export const ClansComponent = () => {
  const [clans, setClans] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [clanName, setClanName] = useState('');
  const [clanDesc, setClanDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchClans();
  }, []);

  const fetchClans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clans');
      setClans(response.data);
    } catch (error) {
      console.error('Failed to fetch clans:', error);
    }
    setLoading(false);
  };

  const createClan = async () => {
    if (!clanName.trim()) return;
    
    try {
      await axios.post(
        'http://localhost:5000/api/clans/create',
        { name: clanName, description: clanDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClanName('');
      setClanDesc('');
      setShowCreate(false);
      fetchClans();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create clan');
    }
  };

  const joinClan = async (clanId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/clans/join/${clanId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchClans();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to join clan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Clans & Gangs
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition"
        >
          <Plus className="w-5 h-5" />
          Create Clan
        </button>
      </motion.div>

      {/* Create Clan Form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
        >
          <input
            type="text"
            placeholder="Clan Name"
            value={clanName}
            onChange={(e) => setClanName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none mb-4"
          />
          <textarea
            placeholder="Clan Description"
            value={clanDesc}
            onChange={(e) => setClanDesc(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none mb-4 resize-none"
            rows="3"
          />
          <button
            onClick={createClan}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition font-semibold"
          >
            Create
          </button>
        </motion.div>
      )}

      {/* Clans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clans.map((clan, index) => (
          <motion.div
            key={clan._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md border border-white/20 hover:border-purple-500/50 transition"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center text-3xl">
                {clan.icon || '⚔️'}
              </div>
              <div>
                <h3 className="font-bold text-lg">{clan.name}</h3>
                <p className="text-sm text-gray-400">Level {clan.level}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">{clan.description}</p>
            <div className="mb-4 text-sm">
              <p>👥 Members: {clan.members?.length || 0}</p>
              <p>💰 Treasury: {clan.treasury}</p>
            </div>
            {user?.clan?._id !== clan._id && (
              <button
                onClick={() => joinClan(clan._id)}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-semibold text-sm"
              >
                Join Clan
              </button>
            )}
            {user?.clan?._id === clan._id && (
              <button
                className="w-full py-2 rounded-lg bg-green-600/50 cursor-default font-semibold text-sm"
                disabled
              >
                ✓ Your Clan
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
