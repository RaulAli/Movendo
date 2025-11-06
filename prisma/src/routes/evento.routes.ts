import { FastifyInstance } from 'fastify';
import * as eventoController from '../controllers/evento.controller';

async function eventoRoutes(fastify: FastifyInstance) {
  fastify.get('/eventos', { schema: { summary: 'Get all eventos', tags: ['events'] } }, eventoController.getAllEventos);
}

export default eventoRoutes;
