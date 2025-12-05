import { FastifyInstance } from 'fastify';
import * as merchantProductController from '../controllers/merchant_products.controller';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';

async function merchantProductRoutes(fastify: FastifyInstance) {

    fastify.get('/merch_products', { schema: { summary: 'Get all merchant products', tags: ['merchant-products'] } }, merchantProductController.getAllMerchantProducts);

}

export default merchantProductRoutes;
