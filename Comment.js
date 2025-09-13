const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
    isVulgar: { type: Boolean, default: false }, // Admin can mark comments as vulgar
    // ... other fields
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);