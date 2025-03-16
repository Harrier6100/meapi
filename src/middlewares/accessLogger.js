const log4js = require('log4js');
log4js.configure('./config/logger.json');
const logger = log4js.getLogger('access');

const accessLogger = (req, res, next) => {
    const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    const method = req.method;
    const statusCode = res.statusCode;
    const request = req.originalUrl;
    logger.info(`[${ip}] ${method} ${statusCode} ${request}`);
    next();
};

module.exports = accessLogger;