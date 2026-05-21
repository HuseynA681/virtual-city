const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { readDatabase, writeDatabase, insert, findById, filter } = require('../store');
const router = express.Router();

const buildUserSummary = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    username: user.username,
    avatar: user.avatar,
    level: user.level
  };
};

// Get all clans
router.get('/', async (req, res) => {
  try {
    const db = readDatabase();
    const clans = filter(db, 'clans', () => true)
      .sort((a, b) => b.level - a.level)
      .map((clan) => ({
        ...clan,
        id: clan._id,
        leader: buildUserSummary(findById(db, 'users', clan.leader)),
        members: (clan.members || []).map((memberId) => buildUserSummary(findById(db, 'users', memberId))).filter(Boolean)
      }));

    res.json(clans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clans' });
  }
});

// Create clan
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = readDatabase();
    const existingClan = filter(db, 'clans', (clan) => clan.name === name)[0];

    if (existingClan) {
      return res.status(400).json({ error: 'Clan name already exists' });
    }

    const user = findById(db, 'users', req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const clan = insert(db, 'clans', {
      name,
      description: description || '',
      icon: 'https://via.placeholder.com/150',
      leader: req.userId,
      members: [req.userId],
      moderators: [],
      level: 1,
      experience: 0,
      treasury: 0,
      joinApprovalRequired: false,
      maxMembers: 100,
      wins: 0,
      losses: 0
    });

    user.clan = clan._id;
    user.clanRole = 'leader';
    writeDatabase(db);

    res.status(201).json(clan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create clan' });
  }
});

// Join clan
router.post('/join/:clanId', authMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const clan = findById(db, 'clans', req.params.clanId);
    const user = findById(db, 'users', req.userId);

    if (!clan) {
      return res.status(404).json({ error: 'Clan not found' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if ((clan.members || []).includes(req.userId)) {
      return res.status(400).json({ error: 'Already in clan' });
    }

    if (clan.members.length >= clan.maxMembers) {
      return res.status(400).json({ error: 'Clan is full' });
    }

    clan.members.push(req.userId);
    user.clan = clan._id;
    user.clanRole = 'member';
    writeDatabase(db);

    res.json({ message: 'Joined clan successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join clan' });
  }
});

// Leave clan
router.post('/leave', authMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const user = findById(db, 'users', req.userId);

    if (!user || !user.clan) {
      return res.status(400).json({ error: 'Not in a clan' });
    }

    const clan = findById(db, 'clans', user.clan);
    if (!clan) {
      user.clan = null;
      user.clanRole = 'member';
      writeDatabase(db);
      return res.json({ message: 'Left clan' });
    }

    clan.members = (clan.members || []).filter((id) => id !== req.userId);
    if (clan.leader === req.userId) {
      clan.leader = clan.members.length > 0 ? clan.members[0] : null;
    }

    user.clan = null;
    user.clanRole = 'member';
    writeDatabase(db);

    res.json({ message: 'Left clan' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave clan' });
  }
});

module.exports = router;
