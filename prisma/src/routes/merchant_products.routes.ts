import { FastifyInstance } from 'fastify';
import * as merchantProductController from '../controllers/merchant_products.controller';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';

async function merchantProductRoutes(fastify: FastifyInstance) {

    fastify.get('/merch_products', { schema: { summary: 'Get all merchant products', tags: ['merchant-products'] } }, merchantProductController.getAllMerchantProducts);
    // Reserva stock (usado por saga)
    fastify.post(
        '/merch/reserve-inventory',
        { schema: { summary: 'Reserve inventory for order', tags: ['merchant-products'] } },
        merchantProductController.reserveInventory
    );

    // Libera (devuelve) stock (compensación)
    fastify.post(
        '/merch/release-inventory',
        { schema: { summary: 'Release inventory for order', tags: ['merchant-products'] } },
        merchantProductController.releaseInventory
    );
}

export default merchantProductRoutes;
