import { FastifyRequest, FastifyReply } from 'fastify';
import * as eventoService from '../services/evento.service';

export const getAllCiudades = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const ciudades = await eventoService.getAllCiudades();
    reply.send(ciudades);
  } catch (error) {
    reply.code(500).send({ error: 'Error al obtener los eventos' });
  }
};

export const getAllEventos = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const eventos = await eventoService.getAllEventos();
    reply.send(eventos);
  } catch (error) {
    reply.code(500).send({ error: 'Error al obtener los eventos' });
  }
};

export const createEvento = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user;
    const newEvento = await eventoService.createEvento(request.body, user);
    reply.code(201).send(newEvento);
  } catch (error) {
    reply.code(500).send({ error: 'Error al crear el evento' });
  }
};


export const updateEvento = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { slug } = request.params as any;
    const updatedEvento = await eventoService.updateEvento(slug, request.body);
    reply.send(updatedEvento);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: 'Error al actualizar el evento' });
  }
};

export const deleteEvento = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { slug } = request.params as any;
    await eventoService.deleteEvento(slug);
    reply.code(204).send();
  } catch (error) {
    reply.code(500).send({ error: 'Error al eliminar el evento' });
  }
};