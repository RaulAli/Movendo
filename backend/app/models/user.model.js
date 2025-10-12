// models/user.model.js
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
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
}, { timestamps: true });

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

module.exports = mongoose.model('User', userSchema);
