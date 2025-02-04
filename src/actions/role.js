const express = require('express');
const router = express.Router();
const verifyToken = require('@/middlewares/verifyToken');
const Role = require('@/models/role');

router.get('/:userId', verifyToken, async (req, res, next) => {
    const { userId } = req.params;
    try {
        const role = await Role.findOne({ userId });
        if (!role) {
            const error = new Error(`userId:${userId}は存在しません。`);
            error.status = 404;
            throw error;
        }
        res.status(200).json(role);
    } catch (err) {
        next(err);
    }
});

router.put('/:userId', verifyToken, async (req, res, next) => {
    const { userId } = req.params;
    const { routeName, permission } = req.body.route;
    try {
        const role = await Role.findOne({ userId });
        if (!role) {
            const role = new Role();
            role.userId = userId;
            role.permissions.set(routeName, permission);
            role.createdAt = new Date();
            role.createdBy = req.user;
            role.updatedAt = new Date();
            role.updatedBy = req.user;
            const saved = await role.save();
            res.status(201).json(saved);
        } else {
            role.userId = userId;
            role.permissions.set(routeName, permission);
            role.updatedAt = new Date();
            role.updatedBy = req.user;
            const saved = await role.save();
            res.status(200).json(saved);
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;