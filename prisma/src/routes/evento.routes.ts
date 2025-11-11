import { FastifyInstance } from 'fastify';
import * as eventoController from '../controllers/evento.controller';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';

async function eventoRoutes(fastify: FastifyInstance) {
  fastify.get('/eventos/ciudad', { schema: { summary: 'Get all cities', tags: ['events'] } }, eventoController.getAllCiudades);
  fastify.get('/eventos', { schema: { summary: 'Get all eventos', tags: ['events'] } }, eventoController.getAllEventos);
  fastify.post('/eventos', { schema: { summary: 'Create a new evento (admin)', tags: ['events'] }, preHandler: [adminAuthMiddleware] }, eventoController.createEvento);
  fastify.put('/eventos/:slug', { schema: { summary: 'Update a evento (admin)', tags: ['events'] }, preHandler: [adminAuthMiddleware] }, eventoController.updateEvento);
  fastify.delete('/eventos/:slug', { schema: { summary: 'Delete a evento (admin)', tags: ['events'] }, preHandler: [adminAuthMiddleware] }, eventoController.deleteEvento);
}

export default eventoRoutes;
