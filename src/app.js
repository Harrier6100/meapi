const express = require('express');
const cors = require('cors');
const cookie = require('cookie-parser');
const compression = require('compression');
const mongoose = require('mongoose');
const cacheControl = require('@/middlewares/cacheControl');
const accessLogger = require('@/middlewares/accessLogger');
const errorHandler = require('@/middlewares/errorHandler');
const errorLogger = require('@/middlewares/errorLogger');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    process.exit(1);
});

const corsOptions = {
    origin: process.env.ORIGIN,
    credentials: true,
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookie());
app.use(compression());
app.use(cacheControl);
app.use(accessLogger);
app.use('/api', require('@/routes'));
app.use(errorHandler);
app.use(errorLogger);

module.exports = app;