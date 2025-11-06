import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCategory = async (data: any) => {
  return prisma.categories.create({
    data: {
      ...data,
      isActive: true,
      status: 'published',
      v: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
};

export const getAllCategories = async (query: {
  q?: string;
  page?: number;
  limit?: number;
  active?: boolean;
}) => {
  const { q, page = 1, limit = 10, active } = query;
  const where: any = {};

  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: 'insensitive' } },
      { descripcion: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (active !== undefined) where.isActive = active;

  const [total, items] = await Promise.all([
    prisma.categories.count({ where }),
    prisma.categories.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { total, items, page, limit };
};

export const getCategoryById = async (id: string) => {
  return prisma.categories.findUnique({ where: { id } });
};

export const updateCategory = async (id: string, data: any) => {
  return prisma.categories.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });
};

export const softDeleteCategory = async (id: string) => {
  return prisma.categories.update({
    where: { id },
    data: { isActive: false, updatedAt: new Date() },
  });
};

export const restoreCategory = async (id: string) => {
  return prisma.categories.update({
    where: { id },
    data: { isActive: true, updatedAt: new Date() },
  });
};

export const bulkActionCategories = async (
  ids: string[],
  action: 'soft-delete' | 'restore'
) => {
  const data =
    action === 'soft-delete'
      ? { isActive: false, updatedAt: new Date() }
      : { isActive: true, updatedAt: new Date() };

  return prisma.categories.updateMany({
    where: { id: { in: ids } },
    data,
  });
};
