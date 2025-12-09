// controllers/ticket.controller.js
const mongoose = require('mongoose');
const Ticket = require('../models/ticket.model');
const Order = require('../models/order.model'); // si tienes modelo Order
// const Event = require('../models/event.model'); // opcional, si quieres validar event

// Utilidad: valida ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

/**
 * POST /tickets/create
 * Body esperado:
 * {
 *   orderId: "....",       // obligatorio
 *   eventId: "....",       // obligatorio
 *   username: "usuario",   // obligatorio
 *   type?: "general"       // opcional
 * }
 */
exports.create_ticket = async (req, res) => {
    try {
        const { orderId, eventId, username, type } = req.body ?? {};

        // validaciones básicas
        if (!orderId || !eventId || !username) {
            return res.status(400).json({ message: 'orderId, eventId y username son obligatorios' });
        }
        if (!isValidObjectId(orderId)) {
            return res.status(400).json({ message: 'orderId no es un ObjectId válido' });
        }
        if (!isValidObjectId(eventId)) {
            return res.status(400).json({ message: 'eventId no es un ObjectId válido' });
        }

        // opcional: comprobar que la orden existe
        const order = await Order.findById(orderId).lean();
        if (!order) {
            return res.status(404).json({ message: 'Order no encontrada' });
        }

        // Crear ticket
        const ticket = await Ticket.create({
            orderId,
            eventId,
            username,
            type: type || 'general',
            status: 'SHAVED' // segun lo solicitado
        });

        // Responder con el ticket creado (incluye _id generado por Mongo)
        return res.status(201).json({
            message: 'Ticket creado correctamente',
            ticket
        });
    } catch (err) {
        console.error('create_ticket error:', err);
        return res.status(500).json({
            message: 'Error creando el ticket',
            error: err?.message || String(err)
        });
    }
};

/**
 * Helper opcional: crear varios tickets para los items de una order
 * Recibe order (document) y username, crea un ticket por cada item (event).
 * Devuelve array de tickets creados.
 */
exports.createTicketsForOrder = async (orderDoc, username, opts = {}) => {
    if (!orderDoc || !Array.isArray(orderDoc.items)) return [];

    const Ticket = require('../models/ticket.model');
    const created = [];

    for (const item of orderDoc.items) {
        const eventId = typeof item.id_evento === 'string'
            ? item.id_evento
            : (item.id_evento?._id || item.id_evento?.id || String(item.id_evento));

        if (!eventId) continue;

        const ticket = await Ticket.create({
            orderId: orderDoc._id,
            eventId,
            username: username || 'guest',
            type: 'general',
            status: opts.status || 'SHAVED'
        });

        created.push(ticket);
    }

    return created;
};
