import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TOKENS = ['Bank', 'Cafe', 'Park', 'Shop', 'Metro', 'Tower'];

const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const random = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[random]] = [copy[random], copy[index]];
  }
  return copy;
};

const makeDeck = () => shuffle([...TOKENS, ...TOKENS]).map((label, index) => ({
  id: `${label}-${index}`,
  label,
  matched: false
}));

export default function MemoryMatch({ onClose }) {
  const { token, refreshUser } = useAuth();
  const [deck, setDeck] = useState(makeDeck);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState('Match all pairs.');
  const [rewarded, setRewarded] = useState(false);

  const matchedCount = useMemo(() => deck.filter((card) => card.matched).length, [deck]);
  const complete = matchedCount === deck.length;
  const reward = Math.max(60, 220 - moves * 8);

  const awardCoins = async (amount) => {
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
  };

  const chooseCard = (card) => {
    if (locked || complete || card.matched || selected.some((item) => item.id === card.id)) return;

    const nextSelected = [...selected, card];
    setSelected(nextSelected);

    if (nextSelected.length !== 2) return;

    setMoves((current) => current + 1);
    setLocked(true);

    const [first, second] = nextSelected;
    if (first.label === second.label) {
      setDeck((current) => current.map((item) => (
        item.label === first.label ? { ...item, matched: true } : item
      )));
      setSelected([]);
      setLocked(false);
      setMessage('Match found.');
      return;
    }

    setMessage('Try another pair.');
    setTimeout(() => {
      setSelected([]);
      setLocked(false);
    }, 700);
  };

  React.useEffect(() => {
    if (!complete || rewarded) return;

    setRewarded(true);
    setMessage(`Board cleared. You earned ${reward} coins.`);
    awardCoins(reward);
  }, [complete, reward, rewarded]);

  const reset = () => {
    setDeck(makeDeck());
    setSelected([]);
    setMoves(0);
    setLocked(false);
    setMessage('Match all pairs.');
    setRewarded(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h3 className="text-lg font-bold">Memory Match</h3>
        <button type="button" onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" aria-label="Close game">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Stat label="Moves" value={moves} />
        <Stat label="Matched" value={`${matchedCount / 2}/${deck.length / 2}`} />
        <Stat label="Reward" value={`${reward} coins`} />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
        {deck.map((card) => {
          const visible = card.matched || selected.some((item) => item.id === card.id);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => chooseCard(card)}
              className={`aspect-[4/3] rounded-lg border text-sm font-bold transition ${
                visible
                  ? 'border-purple-400 bg-purple-500/30 text-white'
                  : 'border-white/20 bg-white/10 text-transparent hover:border-purple-400'
              }`}
            >
              {visible ? card.label : 'Hidden'}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">
          <RotateCcw className="w-4 h-4" />
          New Board
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
