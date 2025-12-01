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

export const hola = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Llamada directa al service
    const response = await eventoService.hola();

    // Enviar respuesta al cliente
    return reply.code(200).send(response);

  } catch (error) {
    return reply.code(500).send({
      error: 'Error al realizar la solicitud en eventoService.hola',
      details: (error as any).message || String(error),
    });
  }
};

export const createEvento = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = request.body as any; // asumimos que viene el JSON del cliente
    const evento = await eventoService.createEvento(body);
    reply.code(201).send(evento);
  } catch (err: any) {
    reply.code(500).send({ error: 'Error al crear el evento', details: err.message });
  }
};
