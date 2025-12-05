import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllMerchantCategories = async () => {
    return prisma.merch_categories.findMany();
};  