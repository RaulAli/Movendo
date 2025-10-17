// models/user.model.js
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');


const userSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true
    },
    image: {
        type: String,
        default: "https://static.productionready.io/images/smiley-cyrus.jpg"
    },
    favouriteEvento: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evento'
    }]
}, { timestamps: true, id: false });

userSchema.plugin(uniqueValidator);

// Generar token con la info mínima (NO incluir password)
userSchema.methods.generateAccessToken = function () {
    const payload = {
        id: this._id,
        email: this.email,
        username: this.username
    };

    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error('ACCESS_TOKEN_SECRET no definido en .env');

    return jwt.sign(payload, secret, { expiresIn });
};

userSchema.methods.toUserResponse = function () {
    return {
        username: this.username,
        email: this.email,
        image: this.image,
        token: this.generateAccessToken()
    };
};

userSchema.methods.toProfileJSON = function (user) {
    return {
        username: this.username,
        image: this.image,
        following: user ? user.isFollowing(this._id) : false
    };
};

userSchema.methods.favorite = function (eventoId) {
    const exists = this.favouriteEvento.some(id => String(id) === String(eventoId));
    if (!exists) this.favouriteEvento.push(eventoId);
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
