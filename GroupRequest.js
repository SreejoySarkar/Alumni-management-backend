const mongoose = require('mongoose');

const GroupRequestSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GroupRequest', GroupRequestSchema);