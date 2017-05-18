var mongoose = require('../index.js');
var Message = require('./Message.js');

// Define the document Schema
var Group = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        required: true
    },
    metadataUpdatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

// Allow us to query by name
Group.query.byName = function(name) {
    return this.findOne({
        name: new RegExp(name, 'i')
    });
};

Group.methods.retrieveLastMessages = function (count) {
    return Message
        .find({
            groupId: this._id
        })
        .asc('createdAt')
        .limit(count)
        .select({
            body: 1,
            createdAt: 1,
            sender: 1
        });
}

Group.pre('remove', function(next) {
    var group = this;
    this.model('User').update(
        {_id: {$in: this.members}},
        {$pull: {groups: this._id}},
        {multi: true},
        next
    );
});

var metadataMiddleware = function(next) {
    var group = this;

    if (group.isModified('name') || group.isModified('isPublic')) {
        group.metadataUpdatedAt = new Date();
    }

    next();
};

// Set the update middleware on each of the document save and update events
Group.pre('save', metadataMiddleware);
Group.pre('findOneAndUpdate', metadataMiddleware);
Group.pre('update', metadataMiddleware);

// Initialize the model with the schema, and export it
var model = mongoose.model('Group', Group);

module.exports = model;
