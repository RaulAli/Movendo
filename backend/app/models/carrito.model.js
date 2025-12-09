const mongoose = require('mongoose');

const merchantItemSchema = new mongoose.Schema({
    id_product: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false }); // No _id for sub-documents

const cartItemSchema = new mongoose.Schema({
    id_evento: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Evento' // Reference to the Evento model
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    merchants: [merchantItemSchema]
}, { _id: false }); // No _id for sub-documents

const carritoSchema = new mongoose.Schema({
    id_user: {
        type: String, // Storing UUID as a string as Mongoose doesn't have a native UUID type
        required: true
    },
    status: {
        type: String,
        enum: ["active", "pending", "paid", "cancelled", "abandoned"],
        default: "active"
    },
    items: [cartItemSchema]
}, { timestamps: true });

// Partial index to ensure only one active cart per user
carritoSchema.index({ id_user: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });

const Carrito = mongoose.model('Carrito', carritoSchema);

module.exports = Carrito;
