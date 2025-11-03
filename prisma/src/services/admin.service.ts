import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const createAdmin = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.admin.create({ data: { ...data, password: hashedPassword } });
};

export const findAdminByEmail = async (email: string) => {
  return prisma.admin.findUnique({ where: { email } });
};