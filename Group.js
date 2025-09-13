const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    stream: { type: String, required: true }, // For categorized groups
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who created it
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);