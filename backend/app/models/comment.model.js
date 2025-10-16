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
    const authorObj = await User.findById(this.author).exec();
    return {
        id: this._id,
        body: this.body,
        author: authorObj ? {
            id: authorObj._id,
            username: authorObj.username,
            image: authorObj.image
        } : undefined
    };
};

module.exports = mongoose.model('Comment', CommentSchema);
