const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const verifyToken = require('@/middlewares/verifyToken');
const User = require('@/models/user');

router.get('/', async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            const error = new Error(`ID:${id}は存在しません。`);
            error.status = 404;
            throw error;
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.get('/key/:userId', async (req, res, next) => {
    const { userId } = req.params;
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            const error = new Error(`userId:${userId}は存在しません。`);
            error.status = 404;
            throw error;
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.post('/', verifyToken, async (req, res, next) => {
    const { userId } = req.body;
    try {
        const found = await User.findOne({ userId });
        if (found) {
            const error = new Error(`userId:${userId}は既に存在します。`);
            error.status = 409;
            throw error;
        }
        const user = new User();
        user.userId = req.body.userId;
        user.userName = req.body.userName;
        user.email = req.body.email;
        user.password = await bcrypt.hash('lintec', 10);
        user.isAdmin = req.body.isAdmin;
        user.isGuest = req.body.isGuest;
        user.expiryDate = req.body.expiryDate;
        user.createdAt = new Date();
        user.createdBy = req.user;
        user.updatedAt = new Date();
        user.updatedBy = req.user;
        const saved = await user.save();
        res.status(201).json(saved);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            const error = new Error(`ID:${id}は存在しません。`);
            error.status = 404;
            throw error;
        }
        user.userId = req.body.userId;
        user.userName = req.body.userName;
        user.email = req.body.email;
        user.isAdmin = req.body.isAdmin;
        user.isGuest = req.body.isGuest;
        user.expiryDate = req.body.expiryDate;
        user.updatedAt = new Date();
        user.updatedBy = req.user;
        const saved = await user.save();
        res.status(200).json(saved);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const removed = await User.findByIdAndDelete(id);
        if (!removed) {
            const error = new Error(`ID:${id}は存在しません。`);
            error.status = 404;
            throw error;
        }
        res.status(200).json(removed);
    } catch (err) {
        next(err);
    }
});

module.exports = router;