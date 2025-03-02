const log4js = require('log4js');
log4js.configure('./config/logger.json');
const logger = log4js.getLogger('access');

const accessLogger = (req, res, next) => {
    const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    const request = req.originalUrl;
    const method = req.method;
    const statusCode = res.statusCode;
    logger.info(`[${ip}] ${method} ${request} ${statusCode}`);
    next();
};

module.exports = accessLogger;