const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const User = require('./user.model');

const CommentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: [true, 'El comentario es obligatorio'],
        trim: true
    },
    author: {
        type: String,
        ref: 'User',
        required: true
    },
    evento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evento',
        required: true
    }
}, { timestamps: true });

CommentSchema.plugin(uniqueValidator, { message: '{PATH} already taken' });

CommentSchema.methods.toCommentResponse = async function (user) {
    return {
        id: this._id,
        body: this.body,
        createdAt: this.createdAt,
        author: {
            id: user._id,
            username: user.username,
            image: user.image
        }
    };
};

module.exports = mongoose.model('Comment', CommentSchema);
