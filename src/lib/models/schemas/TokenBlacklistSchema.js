const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Document will be automatically deleted when expires
  }
});

module.exports = tokenBlacklistSchema; 