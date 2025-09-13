const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');
const GroupRequest = require('../models/GroupRequest');

// @route   GET /api/groups
// @desc    Get all groups (Alumni group streams)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const groups = await Group.find().populate('members', 'name email').populate('createdBy', 'name');
        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/groups/:id
// @desc    Get a single group by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('members', 'name email').populate('createdBy', 'name');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/groups/:groupId/request-join
// @desc    Alumni requests to join a group
// @access  Private/Alumni
router.post('/:groupId/request-join', protect, authorize('alumni'), async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if already a member
        if (group.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check if a request already exists
        const existingRequest = await GroupRequest.findOne({
            group: req.params.groupId,
            user: req.user._id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You have already sent a request to join this group' });
        }

        const groupRequest = await GroupRequest.create({
            group: req.params.groupId,
            user: req.user._id,
            status: 'pending'
        });

        res.status(201).json({ message: 'Request to join group sent successfully. Awaiting admin approval.', groupRequest });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;