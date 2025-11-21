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
    }],
    followingUsers: [{
        type: String,
        ref: 'User'
    }],
    followersCount: {
        type: Number,
        default: 0
    },
    followingCount: {
        type: Number,
        default: 0
    },
    refreshTokens: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["PUBLISHED", "UNPUBLISHED"],
        default: "PUBLISHED"
    }
}, { timestamps: true, id: false });

userSchema.plugin(uniqueValidator);

// Generar token con la info mínima (NO incluir password)
userSchema.methods.generateAccessToken = function () {
    const payload = {
        id: this._id,
        email: this.email,
        username: this.username,
        role: 'client'
    };

    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error('ACCESS_TOKEN_SECRET no definido en .env');

    return jwt.sign(payload, secret, { expiresIn });
};

userSchema.methods.generateRefreshToken = function () {
    const payload = {
        id: this._id,
    };
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'; // Example: 7 days
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) throw new Error('REFRESH_TOKEN_SECRET no definido en .env');

    return jwt.sign(payload, secret, { expiresIn });
};

userSchema.methods.toUserResponse = function () {
    return {
        username: this.username,
        email: this.email,
        image: this.image,
    };
};

userSchema.methods.toProfileJSON = async function (user) {
    const commentsCount = await mongoose.model('Comment').countDocuments({ author: this._id });
    return {
        username: this.username,
        image: this.image,
        following: user ? user.isFollowing(this._id) : false,
        followersCount: this.followersCount,
        followingCount: this.followingCount,
        favoritesCount: this.favouriteEvento.length,
        commentsCount: commentsCount
    };
};

userSchema.methods.favorite = function (eventoId) {
    const exists = this.favouriteEvento.some(id => String(id) === String(eventoId));
    if (!exists) this.favouriteEvento.push(eventoId);
    return this.save();
};

userSchema.methods.unfavorite = function (eventoId) {
    this.favouriteEvento = this.favouriteEvento.filter(id => String(id) !== String(eventoId));
    return this.save();
};

userSchema.methods.isFavorite = function (id) {
    return this.favouriteEvento.some((favoriteId) => {
        return favoriteId.toString() === id.toString();
    });
};

userSchema.methods.isFollowing = function (id) {
    const idStr = id.toString();
    for (const followingUser of this.followingUsers) {
        if (followingUser.toString() === idStr) {
            return true;
        }
    }
    return false;
};

userSchema.methods.follow = function (id) {
    if (this.followingUsers.indexOf(id) === -1) {
        this.followingUsers.push(id);
    }
    return this.save();
};

userSchema.methods.unfollow = function (id) {
    if (this.followingUsers.indexOf(id) !== -1) {
        this.followingUsers.pull(id);
    }
    return this.save();
};

userSchema.methods.updateFollowersCount = async function (user) {
    const a = await user.save();
    this.followersCount = await mongoose.model('User').countDocuments({ followingUsers: this._id });
    const b = await this.save();
    return { a, b };
};

userSchema.methods.addRefreshToken = async function (token) {
    this.refreshTokens.push(token);
    await this.save();
};

userSchema.methods.removeRefreshToken = async function (token) {
    this.refreshTokens = this.refreshTokens.filter(t => t !== token);
    await this.save();
};

module.exports = mongoose.model('User', userSchema);
