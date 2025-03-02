const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    if (statusCode < 500) {
        res.status(statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        res.status(statusCode).json(err);
        next(err);
    }
};

module.exports = errorHandler;