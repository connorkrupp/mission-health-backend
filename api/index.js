var express = require('express');
var router = express.Router();


// http://localhost:3000/
router.get('/', function(req, res, next) {
    res.status(200)
      .json({
        status: 'success',
        message: 'Live long and prosper!'
      });
});


//////////////////////
// Postgres queries
//////////////////////

var db = require('./queries');

router.get('/api/users/:userid', db.getUser);
router.get('/api/groups/:groupid', db.getGroupInfo);
router.post('/api/groups', db.createGroup);

module.exports = router;
