const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // If post is in a group
    text: { type: String, required: true },
    companyName: { type: String }, // For "when other companies are coming"
    // ... other fields like image/file uploads
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);