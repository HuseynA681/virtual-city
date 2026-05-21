const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String },
  
  content: { type: String, required: true },
  channel: { type: String, default: 'global', enum: ['global', 'clan', 'dm', 'system'] },
  
  // For DMs and clan messages
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clan: { type: mongoose.Schema.Types.ObjectId, ref: 'Clan' },
  
  // Message properties
  edited: { type: Boolean, default: false },
  editedAt: { type: Date },
  deleted: { type: Boolean, default: false },
  reactions: [{ emoji: String, users: [mongoose.Schema.Types.ObjectId] }],
  
  createdAt: { type: Date, default: Date.now, index: { expires: 604800 } } // Auto-delete after 7 days
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
