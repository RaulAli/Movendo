import { FastifyRequest, FastifyReply } from 'fastify';
import * as merchantCategoriesService from '../services/merchant_categories.service';

export const getAllMerchantCategories = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const merch_categories = await merchantCategoriesService.getAllMerchantCategories();
        reply.send(merch_categories);
    } catch (error) {
        reply.code(500).send({ error: 'Error al obtener las merch_categories' });
    }
};