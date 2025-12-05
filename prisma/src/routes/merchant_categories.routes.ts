import { FastifyInstance } from 'fastify';
import * as merchantCategoriesController from '../controllers/merchant_categories.controller';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';

async function merchantCategoriesRoutes(fastify: FastifyInstance) {

    fastify.get('/merch_categories', { schema: { summary: 'Get all merchant categories', tags: ['merchant-categories'] } }, merchantCategoriesController.getAllMerchantCategories);

}

export default merchantCategoriesRoutes;
