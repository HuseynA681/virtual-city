const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Chess } = require('chess.js');
const { ensureDatabase, readDatabase, findById } = require('./store');
const { isOwnerUser } = require('./middleware/auth');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: [
      'https://6a0f4b017478dd000858a0fb--virtual-city.netlify.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper to mount routes after DB is ready
const mountRoutes = () => {
  const authRouter = require('./routes/auth');
  console.log('Mounting auth routes:', authRouter.stack.map((layer) => layer.route && layer.route.path));
  app.use('/api/auth', authRouter);
  app.use('/api/users', require('./routes/users'));
  app.use('/api/chat', require('./routes/chat'));
  app.use('/api/inventory', require('./routes/inventory'));
  app.use('/api/marketplace', require('./routes/marketplace'));
  app.use('/api/apartments', require('./routes/apartments'));
  app.use('/api/clans', require('./routes/clans'));
  app.use('/api/admin', require('./routes/admin'));
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const mountFinalHandlers = () => {
  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error Handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });
};

let serverStarted = false;
const startServer = () => {
  if (serverStarted) return;
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    serverStarted = true;
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket connected`);
  });
};

const initServer = async () => {
  await ensureDatabase();
  mountRoutes();
  mountFinalHandlers();
  startServer();
};

initServer().catch((error) => {
  if (error?.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error(
      'Failed to initialize server: MySQL access denied. Check MYSQL_USER/MYSQL_PASSWORD and make sure your MySQL host allows remote connections from this server IP.',
      error
    );
  } else {
    console.error('Failed to initialize server:', error);
  }
  process.exit(1);
});

// Routes are mounted immediately after DB initialization

// WebSocket Events
const connectedUsers = new Map();
const chessGames = new Map();

const createChessCode = () => {
  let code = '';
  do {
    code = Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (chessGames.has(code));
  return code;
};

const chessStatus = (game) => {
  if (game.isCheckmate()) return `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate.`;
  if (game.isDraw()) return 'Draw.';
  if (game.isCheck()) return `${game.turn() === 'w' ? 'White' : 'Black'} is in check.`;
  return `${game.turn() === 'w' ? 'White' : 'Black'} to move.`;
};

const serializeChessGame = (code, room, message) => ({
  code,
  fen: room.game.fen(),
  history: room.game.history({ verbose: true }),
  turn: room.game.turn(),
  status: chessStatus(room.game),
  message,
  players: room.players,
  lastMove: room.lastMove,
  gameOver: room.game.isGameOver()
});

const emitChessGame = (code, message) => {
  const room = chessGames.get(code);
  if (!room) return;
  io.to(`chess:${code}`).emit('chess-state', serializeChessGame(code, room, message));
};

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const db = readDatabase();
    const user = findById(db, 'users', decoded.userId);

    if (!user) return next(new Error('User not found'));

    socket.data.user = {
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      isAdmin: Boolean(user.isAdmin || isOwnerUser(user))
    };
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);
  
  socket.on('join-chat', () => {
    const { id: userId, username } = socket.data.user;
    connectedUsers.set(socket.id, { userId, username, socketId: socket.id });
    socket.join('global-chat');
    
    io.to('global-chat').emit('user-joined', {
      userId,
      username,
      onlineCount: connectedUsers.size,
      timestamp: new Date()
    });
  });

  socket.on('send-message', (data) => {
    const user = connectedUsers.get(socket.id);
    console.log('Send-message received:', { socketId: socket.id, user, data });
    if (user) {
      console.log('Emitting message to global-chat:', { userId: user.userId, username: user.username, message: data.message });
      io.to('global-chat').emit('receive-message', {
        userId: user.userId,
        username: user.username,
        message: data.message,
        timestamp: new Date(),
        avatar: data.avatar
      });
    } else {
      console.warn('User not found in connectedUsers for socket:', socket.id);
    }
  });

  socket.on('chat-cleared', () => {
    if (socket.data.user?.isAdmin) {
      io.to('global-chat').emit('chat-cleared');
    }
  });

  socket.on('typing', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      socket.broadcast.to('global-chat').emit('user-typing', {
        username: user.username,
        userId: user.userId
      });
    }
  });

  socket.on('chess-create-game', (callback) => {
    const code = createChessCode();
    const user = socket.data.user;
    const room = {
      game: new Chess(),
      players: {
        white: { id: user.id, username: user.username, socketId: socket.id },
        black: null
      },
      lastMove: null
    };

    chessGames.set(code, room);
    socket.join(`chess:${code}`);
    const state = serializeChessGame(code, room, 'Game created. Share the code with a friend.');
    socket.emit('chess-state', state);
    if (typeof callback === 'function') callback({ ok: true, state, color: 'w' });
  });

  socket.on('chess-join-game', ({ code } = {}, callback) => {
    const normalizedCode = String(code || '').trim().toUpperCase();
    const room = chessGames.get(normalizedCode);
    const user = socket.data.user;

    if (!room) {
      if (typeof callback === 'function') callback({ ok: false, error: 'Chess game not found.' });
      return;
    }

    let color = 'spectator';
    if (room.players.white?.id === user.id) {
      room.players.white.socketId = socket.id;
      color = 'w';
    } else if (room.players.black?.id === user.id) {
      room.players.black.socketId = socket.id;
      color = 'b';
    } else if (!room.players.black) {
      room.players.black = { id: user.id, username: user.username, socketId: socket.id };
      color = 'b';
    }

    socket.join(`chess:${normalizedCode}`);
    emitChessGame(normalizedCode, color === 'b' ? `${user.username} joined as black.` : `${user.username} joined.`);
    const state = serializeChessGame(normalizedCode, room);
    if (typeof callback === 'function') callback({ ok: true, state, color });
  });

  socket.on('chess-move', ({ code, from, to, promotion } = {}, callback) => {
    const normalizedCode = String(code || '').trim().toUpperCase();
    const room = chessGames.get(normalizedCode);
    const user = socket.data.user;

    if (!room) {
      if (typeof callback === 'function') callback({ ok: false, error: 'Chess game not found.' });
      return;
    }

    const turn = room.game.turn();
    const player = turn === 'w' ? room.players.white : room.players.black;
    if (!player || player.id !== user.id) {
      if (typeof callback === 'function') callback({ ok: false, error: 'It is not your turn.' });
      return;
    }

    let move = null;
    try {
      move = room.game.move({ from, to, promotion: promotion || 'q' });
    } catch {
      move = null;
    }

    if (!move) {
      if (typeof callback === 'function') callback({ ok: false, error: 'Illegal move.' });
      return;
    }

    room.lastMove = { from: move.from, to: move.to };
    emitChessGame(normalizedCode, `${user.username} moved ${move.san}.`);
    if (typeof callback === 'function') callback({ ok: true });
  });

  socket.on('chess-reset-game', ({ code } = {}, callback) => {
    const normalizedCode = String(code || '').trim().toUpperCase();
    const room = chessGames.get(normalizedCode);
    const user = socket.data.user;

    if (!room) {
      if (typeof callback === 'function') callback({ ok: false, error: 'Chess game not found.' });
      return;
    }

    const isPlayer = room.players.white?.id === user.id || room.players.black?.id === user.id;
    if (!isPlayer) {
      if (typeof callback === 'function') callback({ ok: false, error: 'Only players can reset this game.' });
      return;
    }

    room.game = new Chess();
    room.lastMove = null;
    emitChessGame(normalizedCode, `${user.username} started a new game.`);
    if (typeof callback === 'function') callback({ ok: true });
  });

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);
      io.to('global-chat').emit('user-left', {
        userId: user.userId,
        username: user.username,
        onlineCount: connectedUsers.size
      });
    }
    console.log('🔴 User disconnected:', socket.id);
  });
});

// Start server only after DB connection (see connectWithRetry)
