const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const User = require('@/models/user');

const verifyExpiryDate = (expiryDate) => {
    const currentAt = moment().startOf('day');
    const expiryAt = expiryDate ? moment(expiryDate).startOf('day') : null;
    if (expiryAt && expiryAt.isBefore(currentAt)) {
        const error = new Error('アカウントの有効期限が切れています。');
        error.status = 401;
        throw error;
    }
};

const generateAccessToken = (user) => {
    return jsonwebtoken.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h'},
    );
};

const generateRefreshToken = (user) => {
    return jsonwebtoken.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' },
    );
};

router.post('/token', async (req, res, next) => {
    try {
        const { id, password } = req.body;
        
        const user = await User.findOne({ id });
        if (!user) {
            const error = new Error('IDまたはパスワードが無効です。');
            error.status = 401;
            throw error;
        }

        if (!(await bcrypt.compare(password, user.password))) {
            const error = new Error('IDまたはパスワードが無効です。');
            error.status = 401;
            throw error;
        }

        if (user.role === 'guest') {
            verifyExpiryDate(user.expiryDate);
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
    
        res.json({
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
            token: accessToken
        });
    } catch (err) {
        next(err);
    }
});

router.post('/token/refresh', async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            const error = new Error('リフレッシュトークンがありません。');
            error.status = 401;
            throw error;
        }

        const decoded = await new Promise((resolve, reject) => {
            jsonwebtoken.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    const error = new Error('リフレッシュトークンが無効です。');
                    error.status = 401;
                    return reject(error);
                }
                resolve(decoded);
            });
        });

        const user = await User.findOne({ id: decoded.id });
        if (!user) {
            const error = new Error('ユーザーが見つかりません。');
            error.status = 401;
            throw error;
        }
        
        if (user.role === 'guest') {
            verifyExpiryDate(user.expiryDate);
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
            token: newAccessToken
        });
    } catch (err) {
        next(err);
    }
});

router.post('/token/clear', async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(204);
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
    });

    res.sendStatus(204);
});

module.exports = router;