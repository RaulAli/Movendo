import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const normalizeImage = (img: any): string | null => {
  if (img == null) return null;

  // Si es array de strings (URLs), devolver la primera
  if (Array.isArray(img)) return img.length ? String(img[0]) : null;

  // Si es string (URL o data URL)
  if (typeof img === 'string') return img;

  // Si es objeto con url
  if (typeof img === 'object') {
    if (typeof img.url === 'string') return img.url;

    // Si tiene data (ej: { type: 'Buffer', data: [...] } o { data: [...] })
    if (Array.isArray((img as any).data)) {
      try {
        // En Node.js usamos Buffer para convertir a base64
        return Buffer.from((img as any).data).toString('base64');
      } catch {
        // fallback a stringify
        try {
          return JSON.stringify(img);
        } catch {
          return null;
        }
      }
    }

    // fallback: stringify
    try {
      return JSON.stringify(img);
    } catch {
      return null;
    }
  }

  // cualquier otro tipo
  return String(img);
};

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

  const normalizedItems = items.map(i => ({
    ...i,
    image: normalizeImage((i as any).image),
  }));

  return { total, items: normalizedItems, page, limit };
};

export const getCategoryById = async (id: string) => {
  return prisma.categories.findUnique({ where: { id } });
};

export const updateCategoryBySlug = async (slug: string, data: any) => {
  const updated = await prisma.categories.update({
    where: { slug },
    data: { ...data, updatedAt: new Date() },
  });

  // Normalizamos image antes de devolver (coherente con getAllCategories)
  return {
    ...updated,
    image: normalizeImage((updated as any).image),
  };
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
