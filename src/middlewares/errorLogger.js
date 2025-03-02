const log4js = require('log4js');
log4js.configure('./config/logger.json');
const logger = log4js.getLogger('error');

const errorLogger = (req, res, next) => {
    const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    const request = req.originalUrl;
    logger.error(`[${ip}]: ${request}`);
    next();
};

module.exports = errorLogger;