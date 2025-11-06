import { FastifyInstance } from 'fastify';
import * as categoriesController from '../controllers/categories.controller';
import {
    createCategorySchema,
    updateCategorySchema,
    listCategoriesSchema,
    bulkActionCategoriesSchema,
} from '../schemas/categories.schema';
import { adminAuthMiddleware } from '../middlewares/adminAuth.middleware';

async function categoriesRoutes(fastify: FastifyInstance) {
    fastify.get(
        '/categories',
        {
            preHandler: [adminAuthMiddleware],
            schema: {
                ...listCategoriesSchema,
                summary: 'List all categories (admin)',
                tags: ['categories'],
            },
        },
        categoriesController.getAllCategories
    );

    fastify.post(
        '/categories',
        {
            schema: {
                ...createCategorySchema,
                summary: 'Create a new category (admin)',
                tags: ['categories'],
            },
        },
        categoriesController.createCategory
    );

    fastify.get(
        '/categories/:id',
        {
            schema: {
                summary: 'Get category by ID (admin)',
                tags: ['categories'],
            },
        },
        categoriesController.getCategoryById
    );

    fastify.put(
        '/categories/:id',
        {
            schema: {
                ...updateCategorySchema,
                summary: 'Update category by ID (admin)',
                tags: ['categories'],
            },
        },
        categoriesController.updateCategory
    );

    fastify.delete(
        '/categories/:id',
        {
            schema: {
                summary: 'Soft delete category (set isActive=false)',
                tags: ['categories'],
            },
        },
        categoriesController.softDeleteCategory
    );

    fastify.patch(
        '/categories/:id/restore',
        {
            schema: {
                summary: 'Restore a soft-deleted category',
                tags: ['categories'],
            },
        },
        categoriesController.restoreCategory
    );

    fastify.post(
        '/categories/bulk',
        {
            schema: {
                ...bulkActionCategoriesSchema,
                summary: 'Bulk action for categories (soft-delete/restore)',
                tags: ['categories'],
            },
        },
        categoriesController.bulkActionCategories
    );
}

export default categoriesRoutes;
