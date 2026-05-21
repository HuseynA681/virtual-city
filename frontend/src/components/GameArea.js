import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, Crown, Gamepad2, MousePointerClick, Target, Volume2 } from 'lucide-react';
import Chess from './Games/Chess';
import Clicker from './Games/Clicker';
import MemoryMatch from './Games/MemoryMatch';
import NumberGuess from './Games/NumberGuess';
import ReactionRush from './Games/ReactionRush';

export const GameAreaComponent = () => {
  const games = [
    {
      id: 'chess',
      name: 'Chess',
      icon: Crown,
      desc: 'Play white against a quick AI opponent',
      reward: '500 coins'
    },
    {
      id: 'clicker',
      name: 'Clicker',
      icon: MousePointerClick,
      desc: 'Build multipliers and cash out clicks',
      reward: 'Up to 10,000 coins'
    },
    {
      id: 'memory',
      name: 'Memory Match',
      icon: Brain,
      desc: 'Find all matching city tokens',
      reward: '60-220 coins'
    },
    {
      id: 'guess',
      name: 'Number Guess',
      icon: Target,
      desc: 'Guess the secret number in 7 tries',
      reward: '25-150 coins'
    },
    {
      id: 'reaction',
      name: 'Reaction Rush',
      icon: Clock,
      desc: 'Hit the signal as fast as you can',
      reward: '20-180 coins'
    }
  ];

  const [selected, setSelected] = useState('clicker');
  const selectedGame = games.find((game) => game.id === selected);

  const renderGame = () => {
    if (selected === 'chess') return <Chess onClose={() => setSelected(null)} />;
    if (selected === 'clicker') return <Clicker onClose={() => setSelected(null)} />;
    if (selected === 'memory') return <MemoryMatch onClose={() => setSelected(null)} />;
    if (selected === 'guess') return <NumberGuess onClose={() => setSelected(null)} />;
    if (selected === 'reaction') return <ReactionRush onClose={() => setSelected(null)} />;
    return null;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Gamepad2 className="w-6 h-6" />
          Mini Games
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map((game, index) => (
            <motion.button
              key={game.id}
              type="button"
              onClick={() => setSelected(game.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)' }}
              className={`p-6 rounded-lg border transition text-left group ${
                selected === game.id
                  ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/30 border-purple-400'
                  : 'bg-white/10 border-white/20 hover:border-purple-500/80'
              }`}
            >
              <game.icon className="w-10 h-10 mb-3 text-purple-200" />
              <h3 className="font-bold text-lg mb-1">{game.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{game.desc}</p>
              <p className="text-xs text-yellow-400 font-semibold">{game.reward}</p>
              <span className="mt-4 block w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-center text-sm font-semibold opacity-80 group-hover:opacity-100">
                {selected === game.id ? 'Playing' : 'Play Now'}
              </span>
            </motion.button>
          ))}
        </div>

        {selected && selectedGame && (
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-300">
              <selectedGame.icon className="w-4 h-4 text-purple-300" />
              <span>{selectedGame.name}</span>
            </div>
            {renderGame()}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Volume2 className="w-6 h-6 text-purple-400" />
            <div>
              <p className="font-semibold">Ambient City Music</p>
              <p className="text-sm text-gray-400">Lofi beats in the background</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600"
          >
            Now Playing
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
