const mongoose = require('mongoose');

const BlacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // TTL index to automatically remove expired tokens
    },
}, { timestamps: true });

module.exports = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);
