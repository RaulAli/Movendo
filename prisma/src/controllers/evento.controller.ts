import { FastifyRequest, FastifyReply } from 'fastify';
import * as eventoService from '../services/evento.service';

export const getAllEventos = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const eventos = await eventoService.getAllEventos();
    reply.send(eventos);
  } catch (error) {
    reply.code(500).send({ error: 'Error al obtener los eventos' });
  }
};