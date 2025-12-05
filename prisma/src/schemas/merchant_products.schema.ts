import S from 'fluent-json-schema';

export const merchProductSchema = S.object()
    .prop('id', S.string().format('uuid'))
    .prop('brand', S.string())
    .prop('name', S.string())
    .prop('slug', S.string())
    .prop('desc', S.string())
    .prop('price', S.number())
    .prop('stock', S.number())
    .prop('images', S.array().items(S.string()))
    .prop('categoryId', S.string())
    .prop('authorId', S.string())
    .prop('isActive', S.boolean())
    .prop('status', S.string())
    .prop('createdAt', S.string().format('date-time'))
    .prop('updatedAt', S.string().format('date-time'));