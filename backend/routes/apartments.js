const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { readDatabase, writeDatabase, findById } = require('../store');
const router = express.Router();

// Get apartment
router.get('/:userId', async (req, res) => {
  try {
    const db = readDatabase();
    const user = findById(db, 'users', req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.apartment || { furnitureLayout: [], theme: 'modern' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch apartment' });
  }
});

// Update apartment furniture
router.put('/update/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { furnitureLayout, theme } = req.body;
    const db = readDatabase();
    const user = findById(db, 'users', req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.apartment = {
      furnitureLayout: furnitureLayout || [],
      theme: theme || 'modern'
    };

    writeDatabase(db);
    res.json({ message: 'Apartment updated', apartment: user.apartment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update apartment' });
  }
});

module.exports = router;
