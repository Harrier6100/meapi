const jsonwebtoken = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        
        if (!token) {
            const error = new Error('トークンが提供されていません。');
            error.status = 403;
            throw error;
        }

        jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                const error = new Error('トークンが無効です。');
                error.status = 401;
                throw error;
            }
            req.userId = decoded.id;
            req.userName = decoded.name;
            next();
        });
    } catch (err) {
        next(err);
    }
};

module.exports = verifyToken;