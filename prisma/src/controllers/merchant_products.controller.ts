import { FastifyRequest, FastifyReply } from 'fastify';
import * as merchantService from '../services/merchant_products.service';

export const getAllMerchantProducts = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const merch_products = await merchantService.getAllMerchantProducts();
        reply.send(merch_products);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Error al obtener los merch_products' });
    }
};

export const reserveInventory = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const body = request.body as any;
        const items = body?.items;
        const orderId = body?.orderId ?? body?.tempOrderId ?? null;

        if (!items) {
            return reply.code(400).send({ error: 'items are required' });
        }

        const result = await merchantService.reserveInventory(items, orderId);
        return reply.code(200).send(result);
    } catch (err: any) {
        console.error('Error reservando inventario:', err);
        // Si falta stock: 409 Conflict
        if (err.message && err.message.toLowerCase().includes('insufficient stock')) {
            return reply.code(409).send({ error: err.message });
        }
        return reply.code(500).send({ error: err.message ?? 'Error reservando inventario' });
    }
};

export const releaseInventory = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const body = request.body as any;
        const items = body?.items;
        const orderId = body?.orderId ?? body?.tempOrderId ?? null;

        if (!items) {
            return reply.code(400).send({ error: 'items are required' });
        }

        const result = await merchantService.releaseInventory(items, orderId);
        return reply.code(200).send(result);
    } catch (err: any) {
        console.error('Error liberando inventario:', err);
        return reply.code(500).send({ error: err.message ?? 'Error liberando inventario' });
    }
};
