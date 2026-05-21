const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { readDatabase, writeDatabase, findById, findOne, filter, populateUser } = require('../store');
const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const users = filter(db, 'users', () => true).map((user) => {
      const cleanUser = { ...user, id: user._id };
      delete cleanUser.password;
      return cleanUser;
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get User Profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const db = readDatabase();
    const user = findById(db, 'users', req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(populateUser(user, db));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get Current User
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const user = findById(db, 'users', req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(populateUser(user, db));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update Profile
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { bio, avatar, darkMode, notifications } = req.body;
    const db = readDatabase();
    const user = findById(db, 'users', req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (darkMode !== undefined) user.darkMode = darkMode;
    if (notifications !== undefined) user.notifications = notifications;

    writeDatabase(db);

    res.json({ message: 'Profile updated', user: populateUser(user, db) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add Friend
router.post('/friend/add/:friendId', authMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const user = findById(db, 'users', req.userId);
    const friend = findById(db, 'users', req.params.friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.friends.includes(friend._id)) {
      user.friends.push(friend._id);
    }

    if (!friend.friends.includes(user._id)) {
      friend.friends.push(user._id);
    }

    writeDatabase(db);
    res.json({ message: 'Friend added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// Get Users Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const db = readDatabase();
    const users = filter(db, 'users', (u) => !u.isBanned)
      .sort((a, b) => b.level - a.level || b.xp - a.xp)
      .slice(0, 100)
      .map((user) => ({
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        coins: user.coins,
        xp: user.xp
      }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Add coins (for jobs/rewards)
router.post('/add-coins', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount < 0 || amount > 10000) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const db = readDatabase();
    const user = findById(db, 'users', req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.coins = (user.coins || 0) + amount;
    user.xp = (user.xp || 0) + amount / 10;
    writeDatabase(db);

    res.json({ message: 'Coins added', coins: user.coins });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add coins' });
  }
});

module.exports = router;
