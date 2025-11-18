import { FastifyInstance } from 'fastify';
import * as adminController from '../controllers/admin.controller';
import { createAdminSchema, adminLoginSchema } from '../schemas/admin.schema';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';

async function adminRoutes(fastify: FastifyInstance) {
  fastify.post('/admins', { schema: { ...createAdminSchema, summary: 'Create a new admin (admin)', tags: ['admins'] }, preHandler: [adminAuthMiddleware] }, adminController.createAdmin);
  fastify.post('/admins/login', { schema: { ...adminLoginSchema, summary: 'Login as an admin', tags: ['admins'] } }, adminController.login);
}

export default adminRoutes;
