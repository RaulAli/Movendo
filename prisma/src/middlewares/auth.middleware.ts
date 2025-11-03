import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import * as jwt from 'jsonwebtoken';

export const authMiddleware = (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.code(401).send({ error: 'No se proporcionó un token' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return reply.code(401).send({ error: 'Token malformado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SUPER_SECRET');
    (request as any).user = decoded;
  } catch (error) {
    return reply.code(401).send({ error: 'Token inválido' });
  }

  done();
};
