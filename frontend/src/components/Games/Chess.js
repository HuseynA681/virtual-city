import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Chess as ChessEngine } from 'chess.js';
import { motion } from 'framer-motion';
import { Copy, RotateCcw, Swords, Trophy, Users, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const squareName = (row, col) => `${FILES[col]}${8 - row}`;
const pieceAsset = (piece) => (piece ? `/chess-pieces/${piece.color}${piece.type.toUpperCase()}.svg` : '');
const pieceName = (piece) => `${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}`;

const getCapturedPieces = (history) => {
  const capturedWhite = [];
  const capturedBlack = [];

  history.forEach((move) => {
    if (!move.captured) return;
    const captured = { type: move.captured, color: move.color === 'w' ? 'b' : 'w' };
    if (captured.color === 'w') capturedWhite.push(captured);
    if (captured.color === 'b') capturedBlack.push(captured);
  });

  return { capturedWhite, capturedBlack };
};

const evaluateMove = (game, move) => {
  let score = 0;
  if (move.captured) score += VALUES[move.captured] * 10;
  if (move.promotion) score += 8;

  const copy = new ChessEngine(game.fen());
  copy.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
  if (copy.isCheckmate()) score += 1000;
  if (copy.isCheck()) score += 4;

  return score + Math.random();
};

const getStatus = (game) => {
  if (game.isCheckmate()) return game.turn() === 'w' ? 'Black wins by checkmate.' : 'White wins by checkmate.';
  if (game.isDraw()) return 'Draw.';
  if (game.isCheck()) return `${game.turn() === 'w' ? 'White' : 'Black'} is in check.`;
  return `${game.turn() === 'w' ? 'White' : 'Black'} to move.`;
};

const tryMove = (game, move) => {
  try {
    return game.move(move);
  } catch {
    return null;
  }
};

export default function Chess({ onClose }) {
  const { token, refreshUser } = useAuth();
  const { socket } = useChat();
  const [mode, setMode] = useState('solo');
  const [soloGame, setSoloGame] = useState(() => new ChessEngine());
  const [onlineFen, setOnlineFen] = useState(new ChessEngine().fen());
  const [onlineHistory, setOnlineHistory] = useState([]);
  const [onlinePlayers, setOnlinePlayers] = useState({ white: null, black: null });
  const [onlineRoomCode, setOnlineRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerColor, setPlayerColor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('You play white. Select a piece to move.');
  const [rewarded, setRewarded] = useState(false);
  const [dragFrom, setDragFrom] = useState(null);
  const [lastMove, setLastMove] = useState(null);

  const game = useMemo(() => (
    mode === 'online' ? new ChessEngine(onlineFen) : soloGame
  ), [mode, onlineFen, soloGame]);

  const history = mode === 'online' ? onlineHistory : soloGame.history({ verbose: true });
  const { capturedWhite, capturedBlack } = useMemo(() => getCapturedPieces(history), [history]);
  const board = game.board();
  const orientation = mode === 'online' && playerColor === 'b' ? 'black' : 'white';
  const isUsersTurn = mode === 'solo' ? game.turn() === 'w' : playerColor === game.turn();
  const playerLabel = mode === 'online'
    ? playerColor === 'w' ? 'You are white' : playerColor === 'b' ? 'You are black' : 'Spectating'
    : 'Solo vs computer';

  const legalTargets = useMemo(() => {
    if (!selected || !isUsersTurn) return [];
    return game.moves({ square: selected, verbose: true }).map((move) => move.to);
  }, [game, selected, isUsersTurn]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleState = (state) => {
      if (!state?.fen) return;
      setMode('online');
      setOnlineFen(state.fen);
      setOnlineHistory(state.history || []);
      setOnlinePlayers(state.players || { white: null, black: null });
      setOnlineRoomCode(state.code || '');
      setLastMove(state.lastMove || null);
      setSelected(null);
      setMessage(state.message || state.status || 'Online game updated.');
    };

    socket.on('chess-state', handleState);
    return () => socket.off('chess-state', handleState);
  }, [socket]);

  const awardSoloWin = async () => {
    if (rewarded) return;

    setRewarded(true);
    try {
      await axios.post(
        'http://localhost:5000/api/users/add-coins',
        { amount: 500 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (refreshUser) await refreshUser();
      setMessage('Checkmate. You earned 500 coins.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Win reward failed.');
    }
  };

  const syncSoloGame = (nextGame, move = null) => {
    setSoloGame(new ChessEngine(nextGame.fen()));
    if (move) setLastMove({ from: move.from, to: move.to });
  };

  const makeOpponentMove = (nextGame) => {
    if (nextGame.isGameOver()) return;

    const moves = nextGame.moves({ verbose: true });
    if (moves.length === 0) return;

    const bestMove = moves
      .map((move) => ({ move, score: evaluateMove(nextGame, move) }))
      .sort((a, b) => b.score - a.score)[0].move;

    const played = nextGame.move({
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion || 'q'
    });

    syncSoloGame(nextGame, played);
    setMessage(nextGame.isCheckmate() ? 'Black found checkmate.' : 'Your move.');
  };

  const movePiece = async (from, to) => {
    if (mode === 'online') {
      if (!socket || !onlineRoomCode) {
        setMessage('Create or join a friend game first.');
        return;
      }

      socket.emit('chess-move', { code: onlineRoomCode, from, to, promotion: 'q' }, (response) => {
        if (!response?.ok) setMessage(response?.error || 'Move failed.');
      });
      return;
    }

    const nextGame = new ChessEngine(soloGame.fen());
    const move = tryMove(nextGame, { from, to, promotion: 'q' });

    if (!move) {
      setMessage('Illegal move.');
      return;
    }

    syncSoloGame(nextGame, move);
    setSelected(null);

    if (nextGame.isCheckmate()) {
      await awardSoloWin();
      return;
    }

    if (nextGame.isDraw()) {
      setMessage('Draw.');
      return;
    }

    setMessage('Black is thinking...');
    window.setTimeout(() => makeOpponentMove(nextGame), 350);
  };

  const handleSquare = (square, piece) => {
    if (game.isGameOver() || !isUsersTurn) return;

    if (selected) {
      if (square === selected) {
        setSelected(null);
        return;
      }

      if (legalTargets.includes(square)) {
        movePiece(selected, square);
        return;
      }
    }

    if (piece?.color === game.turn() && (mode === 'solo' ? piece.color === 'w' : piece.color === playerColor)) {
      setSelected(square);
      setMessage(`Selected ${square}.`);
    }
  };

  const handleDragStart = (event, square, piece) => {
    if (game.isGameOver() || !isUsersTurn || piece?.color !== game.turn()) {
      event.preventDefault();
      return;
    }

    if (mode === 'online' && piece.color !== playerColor) {
      event.preventDefault();
      return;
    }

    setDragFrom(square);
    setSelected(square);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', square);
  };

  const handleDrop = (event, square) => {
    event.preventDefault();
    const from = dragFrom || event.dataTransfer.getData('text/plain');
    setDragFrom(null);

    const legalDropTargets = game.moves({ square: from, verbose: true }).map((move) => move.to);
    if (from && from !== square && legalDropTargets.includes(square)) {
      movePiece(from, square);
    } else {
      setSelected(null);
      setMessage('Illegal move.');
    }
  };

  const resetSolo = () => {
    setSoloGame(new ChessEngine());
    setSelected(null);
    setMessage('You play white. Select a piece to move.');
    setRewarded(false);
    setLastMove(null);
  };

  const createFriendGame = () => {
    if (!socket) {
      setMessage('Socket is not connected yet.');
      return;
    }

    socket.emit('chess-create-game', (response) => {
      if (!response?.ok) {
        setMessage(response?.error || 'Could not create chess game.');
        return;
      }
      setMode('online');
      setPlayerColor(response.color);
      setMessage('Friend game created. Share the room code.');
    });
  };

  const joinFriendGame = () => {
    if (!socket) {
      setMessage('Socket is not connected yet.');
      return;
    }

    socket.emit('chess-join-game', { code: joinCode }, (response) => {
      if (!response?.ok) {
        setMessage(response?.error || 'Could not join chess game.');
        return;
      }
      setMode('online');
      setPlayerColor(response.color);
      setMessage(response.color === 'spectator' ? 'Joined as spectator.' : 'Joined friend game.');
    });
  };

  const resetOnline = () => {
    if (!socket || !onlineRoomCode) return;
    socket.emit('chess-reset-game', { code: onlineRoomCode }, (response) => {
      if (!response?.ok) setMessage(response?.error || 'Reset failed.');
    });
  };

  const copyRoomCode = async () => {
    if (!onlineRoomCode) return;
    await navigator.clipboard.writeText(onlineRoomCode);
    setMessage(`Copied room code ${onlineRoomCode}.`);
  };

  const displayRows = orientation === 'black' ? [...board].reverse() : board;
  const activeStatus = mode === 'online' ? getStatus(game) : getStatus(soloGame);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-xl bg-[#262421] border border-white/15 shadow-2xl">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-bold">Chess</h3>
          <p className="text-sm text-gray-300">{activeStatus} {playerLabel && `- ${playerLabel}`}</p>
        </div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" aria-label="Close game">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { setMode('solo'); setMessage('Solo mode. You play white.'); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${mode === 'solo' ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/15'}`}
          >
            <Swords className="w-4 h-4" />
            Solo
          </button>
          <button
            type="button"
            onClick={createFriendGame}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${mode === 'online' ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/15'}`}
          >
            <Users className="w-4 h-4" />
            Play Friend
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            className="flex-1 rounded-lg bg-white/10 border border-white/15 px-3 py-2 outline-none focus:border-emerald-400"
            placeholder="Room code"
            maxLength={8}
          />
          <button type="button" onClick={joinFriendGame} className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2">
            Join
          </button>
          {onlineRoomCode && (
            <button type="button" onClick={copyRoomCode} className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500/20 px-4 py-2 text-yellow-100">
              <Copy className="w-4 h-4" />
              {onlineRoomCode}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(320px,640px)_1fr] gap-6">
        <div className="w-full max-w-2xl">
          <div
            className="grid aspect-square overflow-hidden rounded-md border-[10px] border-[#403d39] bg-[#403d39] shadow-2xl"
            style={{
              gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(8, minmax(0, 1fr))'
            }}
          >
            {displayRows.map((row, displayRowIndex) => {
              const actualRowIndex = orientation === 'black' ? 7 - displayRowIndex : displayRowIndex;
              const displaySquares = orientation === 'black' ? [...row].reverse() : row;

              return displaySquares.map((piece, displayColIndex) => {
                const actualColIndex = orientation === 'black' ? 7 - displayColIndex : displayColIndex;
                const square = squareName(actualRowIndex, actualColIndex);
                const dark = (actualRowIndex + actualColIndex) % 2 === 1;
                const active = selected === square;
                const legal = legalTargets.includes(square);
                const moved = lastMove?.from === square || lastMove?.to === square;

                return (
                  <button
                    key={square}
                    type="button"
                  onClick={() => handleSquare(square, piece)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, square)}
                  className={`relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden transition ${
                    dark ? 'bg-[#769656]' : 'bg-[#eeeed2]'
                  } ${moved ? 'shadow-[inset_0_0_0_999px_rgba(255,230,102,0.28)]' : ''} ${active ? 'ring-4 ring-yellow-300 ring-inset' : ''}`}
                >
                    {legal && (
                      <span className={`absolute z-10 rounded-full ${piece ? 'h-full w-full border-[5px] border-black/20' : 'h-5 w-5 bg-black/20'}`} />
                    )}
                    {piece && (
                      <img
                        src={pieceAsset(piece)}
                      alt={pieceName(piece)}
                      draggable={isUsersTurn && piece.color === game.turn() && (mode === 'solo' ? piece.color === 'w' : piece.color === playerColor)}
                      onDragStart={(event) => handleDragStart(event, square, piece)}
                      className="relative z-20 block h-[88%] w-[88%] max-h-full max-w-full select-none object-contain drop-shadow-lg"
                    />
                  )}
                  </button>
                );
              });
            })}
          </div>
        </div>

        <div className="space-y-4">
          {mode === 'online' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PlayerPanel title="White" player={onlinePlayers.white} active={game.turn() === 'w'} />
              <PlayerPanel title="Black" player={onlinePlayers.black} active={game.turn() === 'b'} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Panel title="Captured Black" pieces={capturedBlack} />
            <Panel title="Captured White" pieces={capturedWhite} />
          </div>

          <div className="rounded-lg bg-white/5 p-4 text-sm text-gray-200">{message}</div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={mode === 'online' ? resetOnline : resetSolo} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">
              <RotateCcw className="w-4 h-4" />
              New Game
            </button>
            {mode === 'solo' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-100">
                <Trophy className="w-4 h-4" />
                Win: 500 coins
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const PlayerPanel = ({ title, player, active }) => (
  <div className={`rounded-lg p-4 ${active ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-white/5 border border-transparent'}`}>
    <div className="text-sm text-gray-400">{title}</div>
    <div className="font-semibold">{player?.username || 'Waiting...'}</div>
  </div>
);

const Panel = ({ title, pieces }) => (
  <div className="rounded-lg bg-white/5 p-4">
    <div className="mb-2 text-sm text-gray-400">{title}</div>
    <div className="flex min-h-[32px] flex-wrap items-center gap-1">
      {pieces.length ? pieces.map((piece, index) => (
        <img
          key={`${piece.color}-${piece.type}-${index}`}
          src={pieceAsset(piece)}
          alt={pieceName(piece)}
          className="h-7 w-7 object-contain"
        />
      )) : <span className="text-sm text-gray-500">None</span>}
    </div>
  </div>
);
