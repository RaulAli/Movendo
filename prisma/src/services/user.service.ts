// src/services/user.service.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Crear usuario
export const createUser = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.users.create({
    data: {
      ...data,
      password: hashedPassword,
      isActive: data.isActive ?? true,
      status: data.status ?? 'PUBLISHED',
    },
  });
};

// Obtener usuario por ID
export const getUserById = async (id: string) => {
  return prisma.users.findUnique({ where: { id } });
};

// Obtener usuario por email
export const findUserByEmail = async (email: string) => {
  return prisma.users.findUnique({ where: { email } });
};

export const getUsers = async (options: {
  q?: string;
  page?: number;
  perPage?: number;
  isActive?: boolean;
}) => {
  const { q, page = 1, perPage = 20, isActive } = options;
  const skip = (page - 1) * perPage;

  const where: any = {};
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (q) {
    where.OR = [
      { username: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.users.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.users.count({ where }),
  ]);

  return { items, meta: { page, perPage, total } };
};

export const getUserByUsername = async (username: string) => {
  return prisma.users.findUnique({ where: { username } });
};

export const updateUserByUsername = async (username: string, data: any) => {
  return prisma.users.update({
    where: { username },
    data,
  });
};

// export const deleteUserByUsername = async (username: string) => {
//   return prisma.users.delete({
//     where: { username },
//   });
// };

export const deleteUserByUsername = async (username: string) => {
  try {
    const deletedUser = await prisma.users.delete({
      where: { username },
    });
    return deletedUser;
  } catch (err: any) {
    // Podemos diferenciar errores si se quiere
    throw new Error(err.message || 'Error eliminando usuario');
  }
};
