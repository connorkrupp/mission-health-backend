var promise = require('bluebird');

var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL || 'postgres://connorkrupp@localhost/healthfit';
console.log(connectionString);
var db = pgp(connectionString);


/////////////////////
// Query Functions
/////////////////////

function getUser(req, res, next) {
    var userid = parseInt(req.params.userid);

    db.any('SELECT U.name from users U WHERE U.id = $1', userid)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'retrieved user data'
                });
        })
        .catch(function (err) {
            console.log(err);
            return next(err);
        });
}

function getUserGroups(req, res, next) {
    var userid = parseInt(req.params.userid);
    db.any('SELECT GM.group_id, G.name FROM group_member GM, groups G WHERE GM.user_id = $1 AND G.id = GM.group_id', userid)
        .then(function (groupData) {
            var groupIds = groupData.map(function (group) {
                return group['group_id'];
            });

            var group_comparator = 'GM.group_id = ' + groupIds.join(' OR GM.group_id = ');

            db.any('SELECT GM.group_id, U.id, U.name FROM group_member GM, users U WHERE U.id = GM.user_id AND (' + group_comparator + ')')
                .then(function (userData) {

                    var data = groupData.map(function (group) {
                        var users = userData.filter(function (user) {
                            return user['group_id'] == group['group_id'];
                        }).map(function (user) {
                            return {
                                id: user['id'],
                                name: user['name']
                            };
                        });

                        return Object.assign({}, group, {
                            users: users
                        });
                    });

                    res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Retrived user data'
                        });
                })
                .catch(function (err) {
                    console.log(err);
                    return next(err);
                });
        })
        .catch(function (err) {
            console.log(err);
            return next(err);
        });
}

function getGroupInfo(req, res, next) {
    var groupid = parseInt(req.params.groupid);
    db.any('SELECT G.name as group_name, GM.user_id, U.name FROM groups G, group_member GM, users U WHERE G.id = $1 AND GM.group_id = G.id AND U.id = GM.user_id', groupid)
        .then(function (data) { 

            var group = {}
            group["id"] = groupid;
            console.log(data);
            group["name"] = data[0]["group_name"];
            group["members"] = data.map(function (tuple) {
                return {
                    id: tuple["user_id"],
                    name: tuple["name"]
                };
            });

            res.status(200)
                .json({
                    status: 'success',
                    data: group,
                    message: 'Retrieved user data'
                });
        })
        .catch(function (err) {
            console.log(err);
            return next(err);
        });
}

function createGroup(req, res, next) {
    db.one('INSERT INTO groups (name) values (${name}) RETURNING id', req.body)
        .then(function (data) {
            var groupId = data["id"];
            var userId = req.body.user_id;
            db.none('INSERT INTO group_member (group_id, user_id) values (${groupId}, ${userId})', { groupId, userId }).then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Created one group'
                    });
            })
                .catch(function (err) {
                    console.log(err);
                    return next(err);
                });
        })
        .catch(function (err) {
            console.log(err);
            return next(err);
        });
}

function joinGroup(req, res, next) {
    var groupId = parseInt(req.params.groupid);
    var userId = req.body.user_id;
    db.none('INSERT INTO group_member (group_id, user_id) values (${groupId}, ${userId})', {groupId, userId})
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'joined one group'
                });
        })
        .catch(function (err) {
            console.log(err);
            return next(err);
        });
}

/////////////
// Exports
/////////////

module.exports = {
    getUser: getUser,
    getUserGroups: getUserGroups,
    getGroupInfo: getGroupInfo,
    createGroup: createGroup,
    joinGroup: joinGroup
};
