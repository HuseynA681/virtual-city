const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { readDatabase, writeDatabase, insert, findOne } = require('../store');
const { isOwnerUser } = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = readDatabase();
    const existingUser = findOne(db, 'users', (u) => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      username,
      email,
      password: hashedPassword,
      avatar: 'https://via.placeholder.com/150',
      bio: '',
      level: 1,
      coins: 100000,
      premium: false,
      friends: [],
      clan: null,
      clanRole: 'member',
      inventory: [],
      xp: 0,
      achievements: [],
      lastLogin: new Date().toISOString(),
      notifications: true,
      darkMode: true,
      role: 'user',
      isBanned: false
    };

    userData.role = isOwnerUser(userData) ? 'owner' : 'user';
    const user = insert(db, 'users', userData);

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        coins: user.coins,
        level: user.level,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = readDatabase();
    const user = findOne(db, 'users', (u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'User account is banned' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (isOwnerUser(user)) {
      user.role = 'owner';
    } else if (!user.role) {
      user.role = 'user';
    }

    user.lastLogin = new Date().toISOString();
    writeDatabase(db);

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        coins: user.coins,
        level: user.level,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify Token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;
