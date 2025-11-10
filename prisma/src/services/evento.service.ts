import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllEventos = async () => {
  return prisma.eventos.findMany();
};

export const createEvento = async (data: any, user: any) => {
  const slug = data.nombre.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  return prisma.eventos.create({
    data: {
      ...data,
      slug,
      authorId: user.id,
      createdAt: new Date(),
      endDate: new Date(),
      favouritesCount: 0,
      image: [],
      slug_category: [],
      startDate: new Date(),
      status: 'PUBLISHED',
      updatedAt: new Date(),
    },
  });
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
