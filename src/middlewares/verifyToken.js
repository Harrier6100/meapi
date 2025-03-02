const jsonwebtoken = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        jsonwebtoken.verify(token, SECRET_KEY, (err, decoded) => {
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