const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { readDatabase, writeDatabase, insert, filter, findById } = require('../store');
const router = express.Router();

// Get Global Chat Messages
router.get('/global', async (req, res) => {
  try {
    const db = readDatabase();
    const limit = parseInt(req.query.limit, 10) || 50;
    const messages = filter(db, 'messages', (message) => message.channel === 'global' && !message.deleted)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .reverse();

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send Message (kept for REST, primarily handled via WebSocket)
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { content, channel, recipientId, clanId } = req.body;
    const db = readDatabase();
    const user = findById(db, 'users', req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = insert(db, 'messages', {
      sender: req.userId,
      senderName: user.username,
      senderAvatar: user.avatar,
      content,
      channel: channel || 'global',
      recipient: recipientId || null,
      clan: clanId || null,
      edited: false,
      deleted: false,
      reactions: []
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
