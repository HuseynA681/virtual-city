const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile
  avatar: { type: String, default: 'https://via.placeholder.com/150' },
  bio: { type: String, default: '' },
  level: { type: Number, default: 1 },
  
  // Economy
  coins: { type: Number, default: 1000 },
  premium: { type: Boolean, default: false },
  
  // Social
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  clan: { type: mongoose.Schema.Types.ObjectId, ref: 'Clan' },
  clanRole: { type: String, enum: ['member', 'moderator', 'leader'], default: 'member' },
  
  // Apartment
  apartment: {
    furnitureLayout: { type: [Object], default: [] },
    theme: { type: String, default: 'modern' }
  },
  
  // Inventory
  inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  
  // Stats
  xp: { type: Number, default: 0 },
  achievements: [{ type: String }],
  lastLogin: { type: Date, default: Date.now },
  
  // Preferences
  notifications: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
