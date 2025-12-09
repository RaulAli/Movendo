const mongoose = require('mongoose');

// En order.model.js
const itemSchema = new mongoose.Schema({
    id_evento: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event'
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    merchant: [{
        id_merchant: {
            type: String,
            required: true,
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        }
    }]
}, { _id: false });

const orderSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
        default: null,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'PUBLISHED', 'SHAVED'],
        default: 'PENDING'
    },
    items: [itemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para actualizar updatedAt
orderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', orderSchema);