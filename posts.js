const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private/Alumni
router.post('/', protect, authorize('alumni'), async (req, res) => {
    const { text, group, companyName } = req.body;
    try {
        const newPost = await Post.create({
            user: req.user._id,
            text,
            group: group || null, // Optional: if post is for a specific group
            companyName: companyName || null // For "when other companies are coming"
        });
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/posts
// @desc    Get all posts (or filter by group)
// @access  Private
router.get('/', protect, async (req, res) => {
    const { groupId } = req.query; // e.g., /api/posts?groupId=someId
    try {
        let query = {};
        if (groupId) {
            query.group = groupId;
        }
        const posts = await Post.find(query)
            .populate('user', 'name email stream')
            .populate('group', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/posts/:postId/comments
// @desc    Add a comment to a post
// @access  Private/Alumni
router.post('/:postId/comments', protect, authorize('alumni'), async (req, res) => {
    const { text } = req.body;
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = await Comment.create({
            user: req.user._id,
            post: req.params.postId,
            text
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/posts/:postId/comments
// @desc    Get all comments for a post
// @access  Private
router.get('/:postId/comments', protect, async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;