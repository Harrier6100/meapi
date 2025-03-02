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
        const user = await User.findOne({ id });
        if (!user) {
            const error = new Error(`id:${id}は存在しません。`);
            error.status = 404;
            throw error;
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.post('/', verifyToken, async (req, res, next) => {
    const { id } = req.body;
    try {
        const found = await User.findOne({ id });
        if (found) {
            const error = new Error(`id:${id}は既に存在します。`);
            error.status = 409;
            throw error;
        }
        const user = new User();
        user.id = req.body.id;
        user.name = req.body.name;
        user.email = req.body.email;
        user.password = await bcrypt.hash(req.body.id, 10);
        user.role = req.body.role;
        user.expiryDate = req.body.expiryDate;
        user.createdAt = new Date();
        user.createdBy = req.userName;
        user.createdById = req.userId;
        user.updatedAt = new Date();
        user.updatedBy = req.userName;
        user.updatedById = req.userId;
        const result = await user.save();
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

router.put('/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ id });
        if (!user) {
            const error = new Error(`id:${id}は存在しません。`);
            error.status = 404;
            throw error;
        }
        user.name = req.body.name;
        user.email = req.body.email;
        user.role = req.body.role;
        user.expiryDate = req.body.expiryDate;
        user.updatedAt = new Date();
        user.updatedBy = req.userName;
        user.updatedById = req.userId;
        const result = await user.save();
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', verifyToken, async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await User.findOneAndDelete({ id });
        if (!result) {
            const error = new Error(`id:${id}は存在しません。`);
            error.status = 404;
            throw error;
        }
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;