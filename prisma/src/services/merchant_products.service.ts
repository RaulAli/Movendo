import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllMerchantProducts = async () => {
    return prisma.merch_products.findMany();
};  