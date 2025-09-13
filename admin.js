const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Group = require('../models/Group');
const Comment = require('../models/Comment');
const GroupRequest = require('../models/GroupRequest'); // New import

// @route   POST /api/admin/groups
// @desc    Admin creates a new group
// @access  Private/Admin
router.post('/groups', protect, authorize('admin'), async (req, res) => {
    const { name, description, stream } = req.body;
    try {
        const groupExists = await Group.findOne({ name });
        if (groupExists) {
            return res.status(400).json({ message: 'Group with this name already exists' });
        }
        const group = await Group.create({ name, description, stream, createdBy: req.user._id });
        res.status(201).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/groups/:groupId/add-member/:userId
// @desc    Admin adds a member to a group
// @access  Private/Admin
router.put('/groups/:groupId/add-member/:userId', protect, authorize('admin'), async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        const user = await User.findById(req.params.userId);

        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!group.members.includes(user._id)) {
            group.members.push(user._id);
            await group.save();
            user.groups.push(group._id);
            await user.save();
        }

        res.json({ message: 'Member added to group successfully', group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/groups/:groupId/remove-member/:userId
// @desc    Admin removes a member from a group
// @access  Private/Admin
router.put('/groups/:groupId/remove-member/:userId', protect, authorize('admin'), async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        const user = await User.findById(req.params.userId);

        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (!user) return res.status(404).json({ message: 'User not found' });

        group.members = group.members.filter(memberId => memberId.toString() !== user._id.toString());
        await group.save();

        user.groups = user.groups.filter(groupId => groupId.toString() !== group._id.toString());
        await user.save();

        res.json({ message: 'Member removed from group successfully', group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/users/categorized
// @desc    Get count of alumni in each stream
// @access  Private/Admin
router.get('/users/categorized', protect, authorize('admin'), async (req, res) => {
    try {
        const categorizedAlumni = await User.aggregate([
            { $match: { role: 'alumni', stream: { $ne: null } } },
            { $group: { _id: '$stream', count: { $sum: 1 } } },
            { $project: { stream: '$_id', count: 1, _id: 0 } }
        ]);
        res.json(categorizedAlumni);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/comments/:commentId/mark-vulgar
// @desc    Admin marks a comment as vulgar
// @access  Private/Admin
router.put('/comments/:commentId/mark-vulgar', protect, authorize('admin'), async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.isVulgar = true;
        await comment.save();
        res.json({ message: 'Comment marked as vulgar', comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// NEW ADMIN ROUTES FOR GROUP REQUESTS

// @route   GET /api/admin/group-requests
// @desc    Admin gets all pending group join requests
// @access  Private/Admin
router.get('/group-requests', protect, authorize('admin'), async (req, res) => {
    try {
        const requests = await GroupRequest.find({ status: 'pending' })
            .populate('group', 'name description')
            .populate('user', 'name email stream');
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/group-requests/:requestId/approve
// @desc    Admin approves a group join request
// @access  Private/Admin
router.put('/group-requests/:requestId/approve', protect, authorize('admin'), async (req, res) => {
    try {
        const request = await GroupRequest.findById(req.params.requestId);
        if (!request) {
            return res.status(404).json({ message: 'Group request not found' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request is not pending' });
        }

        const group = await Group.findById(request.group);
        const user = await User.findById(request.user);

        if (!group || !user) {
            return res.status(404).json({ message: 'Group or User not found for this request' });
        }

        // Add user to group members if not already there
        if (!group.members.includes(user._id)) {
            group.members.push(user._id);
            await group.save();
        }
        // Add group to user's groups array if not already there
        if (!user.groups.includes(group._id)) {
            user.groups.push(group._id);
            await user.save();
        }

        request.status = 'approved';
        await request.save();

        res.json({ message: 'Group request approved and member added.', request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/group-requests/:requestId/reject
// @desc    Admin rejects a group join request
// @access  Private/Admin
router.put('/group-requests/:requestId/reject', protect, authorize('admin'), async (req, res) => {
    try {
        const request = await GroupRequest.findById(req.params.requestId);
        if (!request) {
            return res.status(404).json({ message: 'Group request not found' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request is not pending' });
        }

        request.status = 'rejected';
        await request.save();

        res.json({ message: 'Group request rejected.', request });
    } catch (error) {
                console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;