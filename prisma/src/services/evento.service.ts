import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllEventos = async () => {
  return prisma.eventos.findMany();
};

export const updateEvento = async (slug: string, data: any) => {
  return prisma.eventos.update({
    where: { slug },
    data,
  });
};

export const deleteEvento = async (slug: string) => {
  return prisma.eventos.delete({
    where: { slug },
  });
};
