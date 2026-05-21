const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['furniture', 'avatar', 'decoration', 'collectible'], required: true },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  price: { type: Number, required: true },
  icon: { type: String, default: 'https://via.placeholder.com/100' },
  
  // For marketplace
  sellable: { type: Boolean, default: true },
  tradeable: { type: Boolean, default: true },
  
  // Appearance (for furniture)
  color: { type: String, default: '#ffffff' },
  size: { type: Object, default: { width: 1, height: 1 } },
  
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
