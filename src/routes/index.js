const express = require('express');
const router = express.Router();

router.use(require('@/actions/me'));
router.use(require('@/actions/token'));
router.use('/users', require('@/actions/user'));
router.use('/roles', require('@/actions/role'));

module.exports = router;