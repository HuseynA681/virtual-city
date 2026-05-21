const express = require('express');
const { authMiddleware, adminMiddleware, isOwnerUser } = require('../middleware/auth');
const { readDatabase, writeDatabase, findById, filter } = require('../store');

module.exports = (io) => {
  const router = express.Router();

  const findUserByIdOrName = (db, value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return null;

    return filter(db, 'users', () => true).find((user) => (
      String(user._id) === value ||
      user.username?.toLowerCase() === normalized ||
      user.email?.toLowerCase() === normalized
    ));
  };

  const cleanUser = (user) => {
    const cleaned = { ...user, id: user._id };
    delete cleaned.password;
    return cleaned;
  };

// Ban user
router.post('/ban/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const user = findById(db, 'users', req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBanned = true;
    writeDatabase(db);
    res.json({ message: 'User banned', user: cleanUser(user) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Unban user
router.post('/unban/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const user = findById(db, 'users', req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBanned = false;
    writeDatabase(db);
    res.json({ message: 'User unbanned', user: cleanUser(user) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// Promote user to admin
  router.post('/promote/:userId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const db = readDatabase();
      const user = findUserByIdOrName(db, req.params.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.role = 'co-owner';
      writeDatabase(db);
      res.json({ message: 'User promoted to co-owner', user: cleanUser(user) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to promote user' });
    }
  });

  // Demote admin to normal user
  router.post('/demote/:userId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const db = readDatabase();
      const user = findUserByIdOrName(db, req.params.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (isOwnerUser(user)) {
        return res.status(400).json({ error: 'Owner cannot be demoted' });
      }

      user.role = 'elder';
      writeDatabase(db);
      res.json({ message: 'Admin demoted to elder', user: cleanUser(user) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to demote user' });
    }
  });

// Clear chat messages
router.delete('/chat/:channel?', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const channel = req.params.channel || 'global';
    let cleared = 0;

    db.messages = (db.messages || []).map((message) => {
      if (!message.deleted && (!channel || message.channel === channel)) {
        cleared += 1;
        return { ...message, deleted: true };
      }
      return message;
    });

    writeDatabase(db);
    res.json({ message: 'Chat cleared', channel, cleared });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear chat' });
  }
});

// Run admin command by text, useful for chat slash commands
router.post('/command', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rawCommand, ...args] = String(req.body.command || '').trim().split(/\s+/);
    const command = rawCommand?.replace(/^\//, '').toLowerCase();
    const target = args.join(' ');
    const db = readDatabase();

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    if (command === 'help') {
      return res.json({
        message: 'Available commands',
        commands: ['/clear', '/promote username', '/demote username', '/ban username', '/unban username']
      });
    }

    if (command === 'clear') {
      const channel = target || 'global';
      let cleared = 0;
      db.messages = (db.messages || []).map((message) => {
        if (!message.deleted && message.channel === channel) {
          cleared += 1;
          return { ...message, deleted: true };
        }
        return message;
      });
      writeDatabase(db);
      return res.json({ message: `Cleared ${cleared} ${channel} chat messages`, cleared, channel });
    }

    if (!target) {
      return res.status(400).json({ error: `/${command} requires a username, email, or user id` });
    }

    const user = findUserByIdOrName(db, target);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (command === 'promote') {
      user.role = 'co-owner';
      writeDatabase(db);
      return res.json({ message: `${user.username} promoted to co-owner`, user: cleanUser(user) });
    }

    if (command === 'demote') {
      if (isOwnerUser(user)) {
        return res.status(400).json({ error: 'Owner cannot be demoted' });
      }
      user.role = 'elder';
      writeDatabase(db);
      return res.json({ message: `${user.username} demoted to elder`, user: cleanUser(user) });
    }

    if (command === 'ban') {
      user.isBanned = true;
      writeDatabase(db);
      
      // Disconnect banned user from socket.io
      io.to('global-chat').emit('user-banned', { username: user.username });
      
      return res.json({ message: `${user.username} banned`, user: cleanUser(user) });
    }

    if (command === 'unban') {
      user.isBanned = false;
      writeDatabase(db);
      return res.json({ message: `${user.username} unbanned`, user: cleanUser(user) });
    }

    return res.status(400).json({ error: 'Unknown admin command' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run admin command' });
  }
});

// Delete message
router.delete('/message/:messageId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const message = findById(db, 'messages', req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.deleted = true;
    writeDatabase(db);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get site stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const totalUsers = filter(db, 'users', () => true).length;
    const activeUsers = filter(db, 'users', (user) => new Date(user.lastLogin) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
    const totalClans = filter(db, 'clans', () => true).length;
    const bannedUsers = filter(db, 'users', (user) => user.isBanned).length;

    res.json({
      totalUsers,
      activeUsers,
      totalClans,
      bannedUsers,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Fix owner role (internal use)
router.post('/fix-owner-role', async (req, res) => {
  try {
    const db = readDatabase();
    const ownerUser = filter(db, 'users', () => true).find(u => u.username?.trim().toLowerCase() === 'huseyngazade123');
    
    if (!ownerUser) {
      return res.status(404).json({ error: 'Owner user not found' });
    }

    ownerUser.role = 'owner';
    ownerUser.isAdmin = true;
    writeDatabase(db);
    
    res.json({ 
      message: 'Owner role set successfully', 
      user: {
        username: ownerUser.username,
        role: ownerUser.role,
        isAdmin: ownerUser.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fix owner role' });
  }
});

  return router;
};
