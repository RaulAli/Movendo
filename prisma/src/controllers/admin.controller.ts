import { FastifyRequest, FastifyReply } from 'fastify';
import * as adminService from '../services/admin.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export const createAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const newAdmin = await adminService.createAdmin(request.body);
    reply.code(201).send(newAdmin);
  } catch (error) {
    reply.code(500).send({ error: 'Error al crear el administrador' });
  }
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = request.body as any;
    const admin = await adminService.findAdminByEmail(email);

    if (!admin) {
      return reply.code(401).send({ error: 'Credenciales incorrectas' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return reply.code(401).send({ error: 'Credenciales incorrectas' });
    }

    const secret = process.env.JWT_SECRET || 'SUPER_SECRET';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '15m') as any;
    const options: jwt.SignOptions = { expiresIn };
    const token = jwt.sign({ id: admin.id, email: admin.email, role: "admin" }, secret, options);

    reply.send({ token });

  } catch (error) {
    reply.code(500).send({ error: 'Error al iniciar sesión' });
  }
};
