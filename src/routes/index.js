const express = require('express');
const router = express.Router();

router.use(require('@/actions/token'));
router.use(require('@/actions/me'));
router.use('/users', require('@/actions/user'));

module.exports = router;