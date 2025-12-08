const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    id_evento: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event' // Asumiendo que tienes un modelo Event
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    merchant: {
        id_merchant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Merchant',
            default: null
        }
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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