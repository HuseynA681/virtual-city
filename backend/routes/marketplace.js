const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { readDatabase, writeDatabase, insert, findById, filter } = require('../store');
const router = express.Router();

// Get all listings
router.get('/', async (req, res) => {
  try {
    const db = readDatabase();
    const { category, rarity, maxPrice, search } = req.query;

    let listings = filter(db, 'marketplaceListings', (listing) => listing.status === 'active');

    if (category) {
      listings = listings.filter((listing) => listing.category === category);
    }
    if (rarity) {
      listings = listings.filter((listing) => listing.rarity === rarity);
    }
    if (maxPrice) {
      listings = listings.filter((listing) => listing.price <= parseInt(maxPrice, 10));
    }
    if (search) {
      const q = search.toLowerCase();
      listings = listings.filter((listing) => {
        const item = findById(db, 'items', listing.item);
        const seller = findById(db, 'users', listing.seller);
        return (
          (item?.name?.toLowerCase().includes(q) || item?.description?.toLowerCase().includes(q)) ||
          (seller?.username?.toLowerCase().includes(q))
        );
      });
    }

    const result = listings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 100)
      .map((listing) => {
        const item = findById(db, 'items', listing.item);
        const seller = findById(db, 'users', listing.seller);
        return {
          ...listing,
          id: listing._id,
          item,
          seller: seller ? { id: seller._id, username: seller.username, avatar: seller.avatar } : null
        };
      });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Create listing
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { itemId, price } = req.body;
    const db = readDatabase();
    const item = findById(db, 'items', itemId);
    const user = findById(db, 'users', req.userId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const listing = insert(db, 'marketplaceListings', {
      item: itemId,
      seller: req.userId,
      price,
      category: item.type,
      rarity: item.rarity,
      status: 'active',
      buyer: null,
      soldAt: null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ratings: { averageRating: 5, reviews: [] }
    });

    res.status(201).json({
      ...listing,
      id: listing._id,
      item,
      seller: { id: user._id, username: user.username, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Buy item
router.post('/buy/:listingId', authMiddleware, async (req, res) => {
  try {
    const db = readDatabase();
    const listing = findById(db, 'marketplaceListings', req.params.listingId);

    if (!listing || listing.status !== 'active') {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const buyer = findById(db, 'users', req.userId);
    const seller = findById(db, 'users', listing.seller);
    const item = findById(db, 'items', listing.item);

    if (!buyer || !seller || !item) {
      return res.status(404).json({ error: 'Buyer, seller or item not found' });
    }

    if (buyer.coins < listing.price) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    buyer.coins -= listing.price;
    seller.coins += listing.price;

    if (!buyer.inventory.includes(item._id)) {
      buyer.inventory.push(item._id);
    }
    item.owner = buyer._id;

    listing.buyer = buyer._id;
    listing.status = 'sold';
    listing.soldAt = new Date().toISOString();

    writeDatabase(db);
    res.json({ message: 'Item purchased successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to purchase item' });
  }
});

module.exports = router;
