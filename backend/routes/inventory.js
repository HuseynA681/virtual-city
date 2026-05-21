const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { readDatabase, writeDatabase, findById, filter } = require('../store');
const router = express.Router();

// Get User Inventory
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const user = findById(db, 'users', req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const inventory = (user.inventory || [])
      .map((itemId) => findById(db, 'items', itemId))
      .filter(Boolean);

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Add Item to Inventory
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    const db = readDatabase();
    const user = findById(db, 'users', req.userId);
    const item = findById(db, 'items', itemId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!user.inventory.includes(itemId)) {
      user.inventory.push(itemId);
      writeDatabase(db);
    }

    const inventory = user.inventory.map((id) => findById(db, 'items', id)).filter(Boolean);
    res.json({ message: 'Item added to inventory', inventory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Remove Item from Inventory
router.post('/remove/:itemId', authMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const user = findById(db, 'users', req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.inventory = (user.inventory || []).filter((itemId) => itemId !== req.params.itemId);
    writeDatabase(db);

    const inventory = user.inventory.map((id) => findById(db, 'items', id)).filter(Boolean);
    res.json({ message: 'Item removed', inventory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

module.exports = router;
