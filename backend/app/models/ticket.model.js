// models/ticket.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const TicketSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Evento',
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['PUBLISHED', 'PENDING', 'SHAVED'],
        default: 'SHAVED'
    },
    type: {
        type: String,
        default: 'general' // por defecto "general" como pediste
    },
    meta: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// índice compuesto si necesitas búsquedas por order+event
TicketSchema.index({ orderId: 1, eventId: 1 });

module.exports = mongoose.model('Ticket', TicketSchema);
