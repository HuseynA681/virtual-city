const mongoose = require('mongoose');

const clanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'https://via.placeholder.com/150' },
  
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Clan Stats
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  treasury: { type: Number, default: 0 },
  
  // Clan Settings
  joinApprovalRequired: { type: Boolean, default: false },
  maxMembers: { type: Number, default: 100 },
  
  // History
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Clan', clanSchema);
