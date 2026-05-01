const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['waiting', 'allowed', 'completed'], 
    default: 'waiting' 
  },
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Queue', queueSchema);