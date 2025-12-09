import { FastifyInstance } from 'fastify';
import * as paymentController from '../controllers/payment.controller';

async function paymentRoutes(fastify: FastifyInstance) {
    fastify.post('/process-payment', paymentController.procesPayment);
    fastify.get('/cancel-payment', paymentController.cancelPayment);
    fastify.put('/payment/:id', paymentController.updatePayment);

}

export default paymentRoutes;
