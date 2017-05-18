var mongoose = require('../index.js')

// Define the document Schema
var Message = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    }
});

Message.index({
    groupId: 'hashed',
    createdAt: -1
});

// Initialize the model with the schema, and export it
var model = mongoose.model('Message', Message);

module.exports = model;
