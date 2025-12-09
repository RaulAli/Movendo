import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllMerchantProducts = async () => {
    return prisma.merch_products.findMany();
};

type MerchantEntry = { id: string; cantidad: number };
type Item = { id_evento?: any; cantidad?: number; merchant?: Array<Record<string, any>> };


function extractMerchantEntries(items: Item[]): MerchantEntry[] {
    const merchantEntries: MerchantEntry[] = [];

    for (const it of items) {
        if (!Array.isArray(it.merchant)) continue;

        for (const m of it.merchant) {
            const cantidadRaw = m.cantidad ?? m.qty ?? it.cantidad ?? 0;
            const cantidad = Number(cantidadRaw);

            const rawId =
                m.id ??
                m.id_merchant ??
                m.merchant_product_id ??
                m.merch_product_id ??
                m.id_merch ??
                m.productId ??
                null;

            if (rawId == null) {
                throw new Error('merchant entry missing id');
            }
            if (!cantidad || cantidad <= 0) {
                throw new Error('merchant entry missing cantidad or cantidad <= 0');
            }

            const id = String(rawId);

            merchantEntries.push({ id, cantidad });
        }
    }

    return merchantEntries;
}

export const reserveInventory = async (items: Item[], orderId?: string) => {
    if (!Array.isArray(items)) throw new Error('items debe ser un array');

    const merchantEntries = extractMerchantEntries(items);

    return prisma.$transaction(async (tx) => {
        const updated: Array<{ id: string; cantidad: number }> = [];

        for (const me of merchantEntries) {
            const result = await tx.merch_products.updateMany({
                where: {
                    id: me.id,
                    stock: { gte: me.cantidad }
                },
                data: {
                    stock: { decrement: me.cantidad }
                }
            });

            if (result.count === 0) {
                throw new Error(`Insufficient stock for merch_product id=${me.id} (needed ${me.cantidad})`);
            }

            updated.push({ id: me.id, cantidad: me.cantidad });
        }

        return { ok: true, reserved: updated, orderId: orderId ?? null };
    });
};

export const releaseInventory = async (items: Item[], orderId?: string) => {
    if (!Array.isArray(items)) throw new Error('items debe ser un array');

    const merchantEntries = extractMerchantEntries(items);

    return prisma.$transaction(async (tx) => {
        const updated: Array<{ id: string; cantidad: number }> = [];

        for (const me of merchantEntries) {
            const r = await tx.merch_products.update({
                where: { id: me.id },
                data: { stock: { increment: me.cantidad } }
            });

            updated.push({ id: String(r.id), cantidad: me.cantidad });
        }

        return { ok: true, released: updated, orderId: orderId ?? null };
    });
};
