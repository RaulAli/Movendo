import S from 'fluent-json-schema';

export const categorySchema = S.object()
    .prop('id', S.string().format('uuid'))
    .prop('nombre', S.string())
    .prop('descripcion', S.anyOf([S.string(), S.null()]))
    .prop('slug', S.string())
    .prop('image', S.string())
    .prop('isActive', S.boolean())
    .prop('status', S.string())
    .prop('v', S.integer())
    .prop('createdAt', S.string().format('date-time'))
    .prop('updatedAt', S.string().format('date-time'));

export const createCategorySchema = {
    body: S.object()
        .prop('nombre', S.string().minLength(1).required())
        .prop('descripcion', S.string())
        .prop('slug', S.string().minLength(1).required())
        .prop('image', S.string()),
    response: {
        201: categorySchema,
    },
};

export const updateCategorySchema = {
    body: S.object()
        .prop('nombre', S.string())
        .prop('descripcion', S.string())
        .prop('slug', S.string())
        .prop('isActive', S.boolean())
        .prop('image', S.string()),
    response: {
        200: categorySchema,
    },
};


export const listCategoriesSchema = {
    querystring: S.object()
        .prop('q', S.string())
        .prop('page', S.integer().minimum(1))
        .prop('limit', S.integer().minimum(1))
        .prop('active', S.boolean()),
    response: {
        200: S.object()
            .prop('total', S.integer())
            .prop('page', S.integer())
            .prop('limit', S.integer())
            .prop('items', S.array().items(categorySchema)),
    },
};

export const bulkActionCategoriesSchema = {
    body: S.object()
        .prop('ids', S.array().items(S.string()).minItems(1).required())
        .prop('action', S.enum(['soft-delete', 'restore']).required()),
    response: {
        200: S.object()
            .prop('count', S.integer())
            .prop('success', S.boolean()),
    },
};
