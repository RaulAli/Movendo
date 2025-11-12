import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/users.controller';
import {
    createUserSchema,
    userLoginSchema,
    updateUserSchema,
    listUsersSchema,
} from '../schemas/users.schema';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';

async function userRoutes(fastify: FastifyInstance) {
    // Crear usuario (solo admin)
    fastify.post(
        '/users',
        {
            preHandler: [adminAuthMiddleware],
            schema: {
                ...createUserSchema,
                summary: 'Crear un nuevo usuario (solo admin)',
                tags: ['users'],
            },
        },
        userController.createUser
    );

    // Login usuario
    fastify.post(
        '/users/login',
        {
            schema: {
                ...userLoginSchema,
                summary: 'Login de usuario',
                tags: ['users'],
            },
        },
        userController.login
    );

    // Listar todos los usuarios (solo admin)
    fastify.get(
        '/users',
        {
            preHandler: [adminAuthMiddleware],
            schema: {
                ...listUsersSchema,
                summary: 'Listar todos los usuarios (solo admin)',
                tags: ['users'],
            },
        },
        userController.listUsers
    );

    // Obtener un usuario por username
    fastify.get(
        '/users/:username',
        {
            preHandler: [adminAuthMiddleware],
            schema: { summary: 'Obtener usuario por username (solo admin)', tags: ['users'] },
        },
        userController.getUser
    );

    // Actualizar usuario
    fastify.put(
        '/users/:username',
        {
            preHandler: [adminAuthMiddleware],
            schema: { summary: 'Actualizar usuario (solo admin)', tags: ['users'] },
        },
        userController.updateUser
    );

    // Desactivar usuario
    fastify.put(
        '/users/:username/toggle',
        {
            preHandler: [adminAuthMiddleware],
            schema: { summary: 'Desactivar usuario (solo admin)', tags: ['users'] },
        },
        userController.deleteUser
    );

    fastify.delete<{ Params: { username: string } }>(
        '/users/:username',
        {
            preHandler: [adminAuthMiddleware],
            schema: {
                summary: 'Eliminar usuario permanentemente (solo admin)',
                tags: ['users'],
                params: {
                    type: 'object',
                    properties: { username: { type: 'string' } },
                    required: ['username'],
                },
            },
        },
        userController.deleteUserPermanent
    );

}


export default userRoutes;
