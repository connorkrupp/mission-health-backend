var router = require('express').Router(),
    authHandler = require('./api/auth.js'),
    emailHandler = require('./api/email.js'),
    userHandler = require('./api/user.js'),
    groupHandler = require('./api/group.js'),
    authMiddleware = require('../middleware/auth.js');

router.use('/auth', authHandler);
router.use('/email', emailHandler);
router.use('/users', userHandler);
router.use('/groups', groupHandler);

router.get('/', function(req, res) {
    res.send('API');
});

module.exports = router;
