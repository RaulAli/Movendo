import { FastifyRequest, FastifyReply } from 'fastify';
import * as userService from '../services/user.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const newUser = await userService.createUser(request.body);
        reply.code(201).send(newUser);
    } catch (error) {
        console.error('createUser error:', error);
        reply.code(500).send({ error: 'Error al crear el usuario' });
    }
};

export const listUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const qs = request.query as any;
        const page = qs.page ? Number(qs.page) : 1;
        const perPage = qs.perPage ? Number(qs.perPage) : 20;
        const isActive = qs.isActive !== undefined ? qs.isActive === 'true' : undefined;

        const res = await userService.getUsers({ q: qs.q, page, perPage, isActive });
        reply.send(res);
    } catch (error) {
        console.error('listUsers error:', error);
        reply.code(500).send({ error: 'Error al listar usuarios' });
    }
};

export const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const username = (request.params as any).username;
        const user = await userService.getUserByUsername(username);
        if (!user) return reply.code(404).send({ message: 'Usuario no encontrado' });
        reply.send(user);
    } catch (error) {
        console.error('getUser error:', error);
        reply.code(500).send({ error: 'Error al obtener el usuario' });
    }
};

export const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const username = (request.params as any).username;
        const updated = await userService.updateUserByUsername(username, request.body);
        reply.send(updated);
    } catch (error) {
        console.error('updateUser error:', error);
        reply.code(500).send({ error: 'Error al actualizar el usuario' });
    }
};

export const deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const username = (request.params as any).username;
        await userService.deleteUserByUsername(username);
        reply.code(204).send();
    } catch (error) {
        console.error('deleteUser error:', error);
        reply.code(500).send({ error: 'Error al eliminar el usuario' });
    }
};

interface DeleteUserParams {
    username: string;
}

export const deleteUserPermanent = async (
    request: FastifyRequest<{ Params: DeleteUserParams }>,
    reply: FastifyReply
) => {
    const { username } = request.params;

    try {
        const deletedUser = await userService.deleteUserByUsername(username);
        return reply.status(200).send({
            message: `Usuario '${username}' eliminado permanentemente`,
            user: deletedUser,
        });
    } catch (err: any) {
        console.error(err);
        return reply.status(500).send({
            error: `No se pudo eliminar el usuario '${username}'`,
            details: err.message,
        });
    }
};