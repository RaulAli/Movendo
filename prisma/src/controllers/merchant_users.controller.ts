import { FastifyRequest, FastifyReply } from 'fastify';
import * as merchantUsersService from '../services/merchant_users.service';

export const getAllMerchantUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const merchant_users = await merchantUsersService.getAllMerchantUsers();
        reply.send(merchant_users);
    } catch (error) {
        reply.code(500).send({ error: 'Error al obtener los merchant_users' });
    }
};