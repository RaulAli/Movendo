import { FastifyRequest, FastifyReply } from 'fastify';
import * as merchantService from '../services/merchant_products.service';

export const getAllMerchantProducts = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const merch_products = await merchantService.getAllMerchantProducts();
        reply.send(merch_products);
    } catch (error) {
        reply.code(500).send({ error: 'Error al obtener los merch_products' });
    }
};