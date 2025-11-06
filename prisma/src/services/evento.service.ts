import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllEventos = async () => {
  return prisma.evento.findMany();
};
