import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MousePointerClick, RotateCcw, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Clicker({ onClose }) {
  const { token, refreshUser } = useAuth();
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [autoClickLevel, setAutoClickLevel] = useState(0);
  const [pendingCashout, setPendingCashout] = useState(false);
  const [message, setMessage] = useState('');

  const multiplierCost = useMemo(() => 50 * multiplier, [multiplier]);
  const autoClickCost = useMemo(() => 200 * (autoClickLevel + 1), [autoClickLevel]);

  useEffect(() => {
    if (autoClickLevel <= 0) return undefined;

    const id = setInterval(() => {
      setCount((current) => current + autoClickLevel * multiplier);
    }, 1000);

    return () => clearInterval(id);
  }, [autoClickLevel, multiplier]);

  const handleClick = () => {
    setCount((current) => current + multiplier);
  };

  const buyMultiplier = () => {
    if (count < multiplierCost) {
      setMessage(`Need ${multiplierCost} clicks for the next multiplier.`);
      return;
    }

    setCount((current) => current - multiplierCost);
    setMultiplier((current) => current + 1);
    setMessage(`Multiplier upgraded to x${multiplier + 1}.`);
  };

  const buyAutoClick = () => {
    if (count < autoClickCost) {
      setMessage(`Need ${autoClickCost} clicks for the next auto-clicker.`);
      return;
    }

    setCount((current) => current - autoClickCost);
    setAutoClickLevel((current) => current + 1);
    setMessage(`Auto-clicker upgraded to level ${autoClickLevel + 1}.`);
  };

  const cashOut = async () => {
    const amount = Math.min(Math.floor(count), 10000);
    if (amount <= 0) {
      setMessage('Earn some clicks before cashing out.');
      return;
    }

    setPendingCashout(true);
    try {
      await axios.post(
        'http://localhost:5000/api/users/add-coins',
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Cashed out ${amount} coins.`);
      setCount(0);
      if (refreshUser) await refreshUser();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Cash out failed.');
    }
    setPendingCashout(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
      <div className="flex justify-between items-center gap-4 mb-4">
        <h3 className="text-lg font-bold">Clicker</h3>
        <button type="button" onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" aria-label="Close game">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center mb-6">
        <motion.button
          type="button"
          onClick={handleClick}
          whileTap={{ scale: 0.94 }}
          className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-900/40"
        >
          <MousePointerClick className="w-16 h-16" />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Stat label="Clicks" value={count} />
        <Stat label="Multiplier" value={`x${multiplier}`} />
        <Stat label="Auto-click" value={`Lv ${autoClickLevel}`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <button type="button" onClick={buyMultiplier} className="px-3 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40">
          Buy Multiplier ({multiplierCost})
        </button>
        <button type="button" onClick={buyAutoClick} className="px-3 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40">
          Buy Auto-click ({autoClickCost})
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={cashOut} disabled={pendingCashout} className="px-4 py-2 rounded-lg bg-yellow-500/30 hover:bg-yellow-500/40 disabled:opacity-50">
          {pendingCashout ? 'Cashing out...' : 'Cash Out'}
        </button>
        <button type="button" onClick={() => { setCount(0); setMessage('Clicks reset.'); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {message && <div className="mt-4 text-sm text-gray-300">{message}</div>}
    </motion.div>
  );
}

const Stat = ({ label, value }) => (
  <div className="p-4 rounded-lg bg-white/5 text-center">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);
