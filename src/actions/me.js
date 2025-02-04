const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const verifyToken = require('@/middlewares/verifyToken');
const User = require('@/models/user');

router.get('/me', verifyToken, async (req, res, next) => {
    try {
        const user = await fetchUser(req.userId);
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.put('/me/password', verifyToken, async (req, res, next) => {
    const { password } = req.body;
    try {
        const user = await fetchUser(req.userId);
        user.password = await bcrypt.hash(password, 10);
        const saved = await user.save();
        res.status(200).json(saved);
    } catch (err) {
        next(err);
    }
});

const fetchUser = async (userId) => {
    const user = await User.findOne({ userId });
    if (!user) {
        const error = new Error('アカウントが存在しません。');
        error.status = 404;
        throw error;
    }
    return user;
};

module.exports = router;