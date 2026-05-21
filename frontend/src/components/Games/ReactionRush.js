import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { RotateCcw, X, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../config/api';

const getDelay = () => 1200 + Math.floor(Math.random() * 2600);
const getReward = (reactionTime) => {
  if (reactionTime <= 250) return 180;
  if (reactionTime <= 400) return 120;
  if (reactionTime <= 650) return 70;
  return 20;
};

export default function ReactionRush({ onClose }) {
  const { token, refreshUser } = useAuth();
  const [phase, setPhase] = useState('idle');
  const [message, setMessage] = useState('Start a round and wait for the signal.');
  const [best, setBest] = useState(null);
  const [last, setLast] = useState(null);
  const readyAtRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const awardCoins = async (amount) => {
    try {
      await axios.post(
        apiUrl('/api/users/add-coins'),
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (refreshUser) await refreshUser();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Reward failed.');
    }
  };

  const start = () => {
    clearTimeout(timeoutRef.current);
    setPhase('waiting');
    setMessage('Wait for green...');
    setLast(null);

    timeoutRef.current = setTimeout(() => {
      readyAtRef.current = performance.now();
      setPhase('ready');
      setMessage('Now!');
    }, getDelay());
  };

  const press = async () => {
    if (phase === 'waiting') {
      clearTimeout(timeoutRef.current);
      setPhase('idle');
      setMessage('Too early. Start again.');
      return;
    }

    if (phase !== 'ready') return;

    const reactionTime = Math.round(performance.now() - readyAtRef.current);
    const reward = getReward(reactionTime);
    setLast(reactionTime);
    setBest((current) => (current === null ? reactionTime : Math.min(current, reactionTime)));
    setPhase('done');
    setMessage(`${reactionTime}ms reaction. You earned ${reward} coins.`);
    await awardCoins(reward);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h3 className="text-lg font-bold">Reaction Rush</h3>
        <button type="button" onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" aria-label="Close game">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Stat label="Last" value={last === null ? '-' : `${last}ms`} />
        <Stat label="Best" value={best === null ? '-' : `${best}ms`} />
        <Stat label="Max Reward" value="180 coins" />
      </div>

      <button
        type="button"
        onClick={phase === 'idle' || phase === 'done' ? start : press}
        className={`mb-4 flex h-44 w-full items-center justify-center rounded-xl border text-xl font-bold transition ${
          phase === 'ready'
            ? 'border-emerald-300 bg-emerald-500/30'
            : phase === 'waiting'
              ? 'border-yellow-300/40 bg-yellow-500/20'
              : 'border-purple-400/50 bg-purple-500/20 hover:bg-purple-500/30'
        }`}
      >
        <span className="inline-flex items-center gap-3">
          <Zap className="w-7 h-7" />
          {phase === 'idle' || phase === 'done' ? 'Start Round' : phase === 'waiting' ? 'Do Not Click Yet' : 'Click Now'}
        </span>
      </button>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={start} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">
          <RotateCcw className="w-4 h-4" />
          Restart
        </button>
        <span className="text-sm text-gray-300">{message}</span>
      </div>
    </motion.div>
  );
}

const Stat = ({ label, value }) => (
  <div className="p-4 rounded-lg bg-white/5 text-center">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);
