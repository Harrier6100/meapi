const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const User = require('@/models/user');
const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_KEY = process.env.REFRESH_KEY;

router.post('/token', async (req, res, next) => {
    const { userId, password } = req.body;
    try {
        const user = await User.findOne({ userId });
        const passwd = await bcrypt.compare(password, user ? user.password : '');
        if (!user || !passwd) {
            const error = new Error('IDまたはパスワードが無効です。');
            error.status = 401;
            throw error;
        }
        if (user.isGuest) {
            verifyExpiryDate(user.expiryDate);
        }
        const token = issueToken(user);
        res.status(200).json(token);
    } catch (err) {
        next(err);
    }
});

router.post('/token/refresh', async (req, res, next) => {
    const { refreshToken } = req.body;
    try {
        const decoded = await new Promise((resolve, reject) => {
            jsonwebtoken.verify(refreshToken, REFRESH_KEY, (err, decoded) => {
                if (err) {
                    const error = new Error('トークンが無効です。');
                    error.status = 401;
                    return reject(error);
                }
                resolve(decoded);
            });
        });
        if (decoded.isGuest) {
            verifyExpiryDate(decoded.expiryDate);
        }
        const token = issueToken(decoded);
        res.status(200).json(token);
    } catch (err) {
        next(err);
    }
});

const verifyExpiryDate = (expiryDate) => {
    const currentAt = moment().startOf('day');
    const expiryAt = expiryDate ? moment(expiryDate).startOf('day') : null;
    if (expiryAt && expiryAt.isBefore(currentAt)) {
        const error = new Error('アカウントの有効期限が切れています。');
        error.status = 401;
        throw error;
    }
};

const issueToken = (user) => {
    const { userId, userName, isAdmin, isGuest, expiryDate } = user;
    const payload = { userId, userName, isAdmin, isGuest, expiryDate };
    return {
        user: payload,
        token: jsonwebtoken.sign(payload, SECRET_KEY, { expiresIn: '8h' }),
        refreshToken: jsonwebtoken.sign(payload, REFRESH_KEY, { expiresIn: '7d' }),
    };
};

module.exports = router;