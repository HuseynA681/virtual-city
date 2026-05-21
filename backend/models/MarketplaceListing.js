const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  
  status: { type: String, enum: ['active', 'sold', 'expired', 'cancelled'], default: 'active' },
  
  // Purchase History
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  soldAt: { type: Date },
  
  // Filters
  category: { type: String },
  rarity: { type: String },
  
  ratings: {
    averageRating: { type: Number, default: 5 },
    reviews: [{ reviewer: String, rating: Number, comment: String }]
  },
  
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
