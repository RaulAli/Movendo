import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllMerchantUsers = async () => {
    return prisma.merchant_user.findMany();
};