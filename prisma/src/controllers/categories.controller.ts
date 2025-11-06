import { FastifyRequest, FastifyReply } from 'fastify';
import * as categoriesService from '../services/categories.service';

export const getAllCategories = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { q, page, limit, active } = request.query as any;

        const pageNum = page ? Math.max(1, Number(page)) : 1;
        const limitNum = limit ? Math.max(1, Math.min(100, Number(limit))) : 10;
        const activeBool = active === 'true' ? true : active === 'false' ? false : undefined;

        const result = await categoriesService.getAllCategories({
            q,
            page: pageNum,
            limit: limitNum,
            active: activeBool,
        });

        return reply.code(200).send(result);
    } catch (error) {
        request.log?.error(error);
        return reply.code(500).send({ error: 'Error al listar categorías' });
    }
};

export const getCategoryById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const cat = await categoriesService.getCategoryById(String(id));
        if (!cat) return reply.code(404).send({ error: 'Categoría no encontrada' });
        return reply.code(200).send(cat);
    } catch (error) {
        request.log?.error(error);
        return reply.code(500).send({ error: 'Error al obtener la categoría' });
    }
};

export const createCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const payload = request.body as any;
        const created = await categoriesService.createCategory(payload);
        return reply.code(201).send(created);
    } catch (err: any) {
        request.log?.error(err);
        if (err?.code === 'P2002') {
            return reply.code(409).send({ error: 'Slug ya existe' });
        }
        return reply.code(500).send({ error: 'Error al crear la categoría' });
    }
};

export const updateCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const payload = request.body as any;
        const updated = await categoriesService.updateCategory(String(id), payload);
        return reply.code(200).send(updated);
    } catch (err: any) {
        request.log?.error(err);
        if (err?.code === 'P2025') {
            return reply.code(404).send({ error: 'Categoría no encontrada' });
        }
        if (err?.code === 'P2002') {
            return reply.code(409).send({ error: 'Slug ya existe' });
        }
        return reply.code(500).send({ error: 'Error al actualizar la categoría' });
    }
};

export const softDeleteCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const updated = await categoriesService.softDeleteCategory(String(id));
        return reply.code(200).send({ success: true, category: updated });
    } catch (err: any) {
        request.log?.error(err);
        if (err?.code === 'P2025') {
            return reply.code(404).send({ error: 'Categoría no encontrada' });
        }
        return reply.code(500).send({ error: 'Error al eliminar la categoría' });
    }
};


export const restoreCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { id } = request.params as any;
        const restored = await categoriesService.restoreCategory(String(id));
        return reply.code(200).send(restored);
    } catch (err: any) {
        request.log?.error(err);
        if (err?.code === 'P2025') {
            return reply.code(404).send({ error: 'Categoría no encontrada' });
        }
        return reply.code(500).send({ error: 'Error al restaurar la categoría' });
    }
};


export const bulkActionCategories = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { ids, action } = request.body as any;
        const resp = await categoriesService.bulkActionCategories(ids, action);
        return reply.code(200).send({ success: true, ...resp });
    } catch (err: any) {
        request.log?.error(err);
        return reply.code(500).send({ error: 'Error en acción masiva de categorías' });
    }
};
