var mongoose = require('mongoose');
var router = require('express').Router();
var Message = require('../../db/model/Message.js');
var Group = require('../../db/model/Group.js');
var User = require('../../db/model/User.js');
var Responses = require('../../responses/api/email.js');
var authMiddleware = require('../../middleware/auth.js');

// /v1/group
// Lists all groups
router.get('/', function(req, res) {
    Group
        .find()
        .select({
            _id: 1,
            name: 1,
            members: 1
        }).then((groups) => {
            res.send({
                status: true,
                groups: groups
            });
    }).catch((err) => {
        res.send({
            status: false
        });
    });
});

// /v1/group
// Creates new group
router.post('/', authMiddleware('api'), function(req, res) {
    if (req.body.name &&
        (req.body.isPublic === 'true' || req.body.isPublic === 'false')) {

        User.find().byToken(req.authToken).exec().then((user) => {
            var name = req.body.name;
            var isPublic = req.body.isPublic == 'true' ? true : false;

            Group.create({
                name: name,
                isPublic: isPublic,
                creator: user._id,
                members: [user._id]
            }).then((group) => {
                user.groups.push(group);
                user.save();

                res.send({
                    status: true,
                    user: {
                        groups: user.groups
                    },
                    group: group
                });
            }).catch((err) => {
                console.error(err);
                res.status(500).send({
                    status: false
                });
            });

        }).catch((err) => {
            res.send({
                status: false,
                message: 'Error authenticating user'
            });
        });
    } else {
        res.status(401).send({
            status: false,
            message: 'Request format invalid'
        });
    }

});

// Handles /v1/group/join
router.post('/join', function(req, res) {
    res.send({
        status: true,
        message: Responses.EMAIL_NOT_PROVIDED
    });
});

router.patch('/:groupId', authMiddleware('api'), function (req, res) {
    var groupId = req.params.groupId;

    Group.findById(groupId).then((group) => {
        group.name = req.body.name || group.name;
        group.isPublic = req.body.isPublic || group.isPublic;

        group.save().then((group) => {
            res.send({
                status: true,
                group: {
                    _id: group._id,
                    name: group.name,
                    isPublic: group.isPublic,
                    metadataUpdatedAt: group.metadataUpdatedAt
                }
            });
        }).catch((err) => {
            res.send({
                status: false,
                message: 'error updating group'
            });
        });

    }).catch((err) => {
        res.send({
            status: false,
            message: 'group not found'
        });
    });
});

// /v1/group
// Deletes group
router.delete('/:groupid', authMiddleware('api'), function(req, res) {
    var groupid = req.params.groupid;

    User.find().byToken(req.authToken).exec().then((user) => {
        Group.findById(groupid).then((group) => {
            group.remove(function (err, taco) {
                if (!err) {
                    res.send({
                        status: true
                    });
                } else {
                    res.send({
                        status: false,
                        message: 'Error removing group'
                    });
                }
            });
        }).catch((err) => {
            res.send({
                status: false,
                message: 'group not found'
            });
        });
    });
});

router.get('/:groupId/messages', authMiddleware('api'), function (req, res) {
    var groupId = req.params.groupId;
    var limit = parseInt(req.query.limit);
    var since = new Date(parseInt(req.query.since));
    var until = new Date(parseInt(req.query.until));

    if (isNaN(limit)) {
        res.send({
            status: false,
            message: 'invalid query string parameters'
        });
    }

    var sinceIsNaN = isNaN(since);
    var untilIsNaN = isNaN(until);
    var findCondition = { groupId: groupId };

    if (!sinceIsNaN || !untilIsNaN) {
        var createdAtCondition = {};

        if (!sinceIsNaN) {
            createdAtCondition['$gt'] = since;
        }

        if (!untilIsNaN) {
            createdAtCondition['$lt'] = until;
        }

        findCondition['createdAt'] = createdAtCondition;
    }

    Message
        .find(findCondition)
        .sort({createdAt: -1})
        .limit(limit)
        .select({
            body: 1,
            createdAt: 1,
            sender: 1
        })
        .populate('sender', 'full_name')
        .then((messages) => {
        res.send({
            status: true,
            messages: messages
        });
    }).catch((err) => {
        res.send({
            status: false,
            message: 'group not found'
        });
    });
});

router.post('/:groupid/messages', authMiddleware('api'), function (req, res) {

    if (req.body.message) {
        User.find().byToken(req.authToken).exec().then((user) => {
            var groupid = req.params.groupid;

            Group.findById(groupid).then((group) => {
                Message.create({
                    body: req.body.message,
                    sender: user,
                    groupId: group
                }).then((message) => {
                    res.send({
                        status: true,
                        message: {
                            messageId: message._id,
                            body: message.body,
                            createdAt: message.createdAt,
                            sender: user._id,
                            groupId: groupid
                        }
                    });
                }).catch((err) => {
                    console.error(err);
                    res.status(500).send({
                        status: false
                    });
                });
            }).catch((err) => {
                res.send({
                    status: false,
                    message: 'group not found'
                });
            });
        }).catch((err) => {
            res.send({
                status: false,
                message: 'Error authenticating user'
            });
        });
    } else {
        res.status(401).send({
            status: false,
            message: 'Request format invalid'
        });
    }
});

module.exports = router;
