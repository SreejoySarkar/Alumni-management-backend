const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update current user profile (Alumni can upload personal details)
// @access  Private/Alumni
router.put('/profile', protect, authorize('alumni'), async (req, res) => {
    const { headline, company, position, bio } = req.body; // Add more fields as needed
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.personalDetails.headline = headline || user.personalDetails.headline;
            user.personalDetails.company = company || user.personalDetails.company;
            user.personalDetails.position = position || user.personalDetails.position;
            user.personalDetails.bio = bio || user.personalDetails.bio;
            user.detailsFilled = true; // Mark details as filled

            const updatedUser = await user.save();
            res.json({
                message: 'Profile updated successfully',
                personalDetails: updatedUser.personalDetails,
                detailsFilled: updatedUser.detailsFilled
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;