var router = require('express').Router();
var User = require('../../db/model/User.js');
var authMiddleware = require('../../middleware/auth.js');

router.get('/profile', authMiddleware('api'), function(req, res) {
    User.find().byToken(req.authToken).exec().then((user) => {
        res.send({
            status: true,
            user: {
                id: user._id,
                email: user.email,
                full_name: user.full_name,
                birthdate: user.birthdate,
                profile: user.profile_pic,
                groups: user.groups
            }
        });
    }).catch((err) => {
        res.send({
            status: false
        });
    });
});

// Handles /v1/user/groups
router.get('/groups', authMiddleware('api'), function(req, res) {
    User
        .find()
        .byToken(req.authToken)
        .select({
            groups: 1
        })
        .populate('groups', 'name isPublic metadataUpdatedAt')
        .then((user) => {
        res.send({
            status: true,
            groups: user.groups
        });
    }).catch((err) => {
        res.send({
            status: false
        });
    });
});

module.exports = router;
