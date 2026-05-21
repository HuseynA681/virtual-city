import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { RotateCcw, Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const makeSecret = () => Math.floor(Math.random() * 100) + 1;

export default function NumberGuess({ onClose }) {
  const { token, refreshUser } = useAuth();
  const [secret, setSecret] = useState(makeSecret);
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('playing');
  const [message, setMessage] = useState('Pick a number from 1 to 100.');
  const [rewarding, setRewarding] = useState(false);
  const attemptsLeft = 7 - history.length;

  const reward = useMemo(() => Math.max(25, 150 - history.length * 20), [history.length]);

  const awardCoins = async (amount) => {
    setRewarding(true);
    try {
      await axios.post(
        'http://localhost:5000/api/users/add-coins',
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (refreshUser) await refreshUser();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Reward failed.');
    }
    setRewarding(false);
  };

  const submitGuess = async () => {
    if (status !== 'playing') return;

    const value = Number(guess);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      setMessage('Enter a whole number from 1 to 100.');
      return;
    }

    const nextHistory = [...history, value];
    setHistory(nextHistory);
    setGuess('');

    if (value === secret) {
      setStatus('won');
      setMessage(`Correct. You earned ${reward} coins.`);
      await awardCoins(reward);
      return;
    }

    if (nextHistory.length >= 7) {
      setStatus('lost');
      setMessage(`Out of tries. The number was ${secret}.`);
      return;
    }

    setMessage(value < secret ? 'Higher.' : 'Lower.');
  };

  const reset = () => {
    setSecret(makeSecret());
    setGuess('');
    setHistory([]);
    setStatus('playing');
    setMessage('Pick a number from 1 to 100.');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h3 className="text-lg font-bold">Number Guess</h3>
        <button type="button" onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" aria-label="Close game">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Stat label="Attempts Left" value={attemptsLeft} />
        <Stat label="Reward" value={`${reward} coins`} />
        <Stat label="Range" value="1-100" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="number"
          min="1"
          max="100"
          value={guess}
          disabled={status !== 'playing'}
          onChange={(event) => setGuess(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && submitGuess()}
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none transition"
          placeholder="Your guess"
        />
        <button
          type="button"
          onClick={submitGuess}
          disabled={status !== 'playing' || rewarding}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Guess
        </button>
        <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15">
          <RotateCcw className="w-4 h-4" />
          New
        </button>
      </div>

      <div className="rounded-lg bg-white/5 p-4 text-sm text-gray-200">{message}</div>

      {history.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {history.map((item, index) => (
            <span key={`${item}-${index}`} className="rounded-full bg-white/10 px-3 py-1 text-sm">
              {item}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

const Stat = ({ label, value }) => (
  <div className="p-4 rounded-lg bg-white/5 text-center">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);
