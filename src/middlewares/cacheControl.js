const cacheControl = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Expires', 0);
    res.setHeader('Pragma', 'no-cache');
    next();
};

module.exports = cacheControl;