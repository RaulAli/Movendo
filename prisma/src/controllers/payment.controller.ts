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

export const updatePayment = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const params = request.params as any;
        const paymentId = params?.id;

        const result = await paymentService.shavePayment(paymentId);

        if (result.success) {
            return reply.code(200).send(result); // { success: true, payment }
        }

        // errores controlados
        if (result.error === 'Id Required') {
            return reply.code(400).send(result);
        }
        if (result.error === 'Payment not found') {
            return reply.code(404).send(result);
        }

        // otros errores del service -> 500
        return reply.code(500).send(result);
    } catch (err: any) {
        request.log?.error?.(err);
        return reply.code(500).send({ success: false, error: err?.message ?? 'Internal server error' });
    }
};
