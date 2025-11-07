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

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { email, password } = request.body as any;
        const user = await userService.findUserByEmail(email);

        if (!user) {
            return reply.code(401).send({ error: 'Credenciales incorrectas' });
        }

        const passwordMatch = await bcrypt.compare(password, (user as any).password);
        if (!passwordMatch) {
            return reply.code(401).send({ error: 'Credenciales incorrectas' });
        }

        const secret = process.env.JWT_SECRET || 'SUPER_SECRET';
        const expiresIn = (process.env.JWT_EXPIRES_IN || '15m') as any;
        const options: jwt.SignOptions = { expiresIn };
        const token = jwt.sign(
            { username: user.username, email: user.email, isAdmin: false },
            secret,
            options
        );

        const { password: _p, refreshTokens, ...publicUser } = user as any;
        reply.send({ token, user: publicUser });
    } catch (error) {
        console.error('login error:', error);
        reply.code(500).send({ error: 'Error al iniciar sesión' });
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
