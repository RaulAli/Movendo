import { FastifyRequest, FastifyReply } from 'fastify';
import * as paymentService from '../services/payment.service';

export const procesPayment = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const body = request.body as any;
        const payment = await paymentService.procesPayment(body);
        reply.send(payment);
    } catch (error) {
        reply.code(500).send({ error: 'Error al Realizar el Pago' });
    }
};

export const cancelPayment = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const payment = await paymentService.cancelPayment();
        reply.send(payment);
    } catch (error) {
        reply.code(500).send({ error: 'Error al Cancelar El pago' });
    }
};
