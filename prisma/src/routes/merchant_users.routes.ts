import { FastifyInstance } from 'fastify';
import * as merchantUsersController from '../controllers/merchant_users.controller';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware'; // Assuming this middleware is relevant

async function merchantUsersRoutes(fastify: FastifyInstance) {

    fastify.get('/merchant_users', { schema: { summary: 'Get all merchant users', tags: ['merchant-users'] } }, merchantUsersController.getAllMerchantUsers);

}

export default merchantUsersRoutes;
