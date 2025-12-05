import S from 'fluent-json-schema';

export const merchCategoriesSchema = S.object()
    .prop('id', S.string().format('uuid'))
    .prop('name', S.string())
    .prop('slug', S.string())
    .prop('desc', S.string())
    .prop('isActive', S.boolean())
    .prop('authorId', S.string())
    .prop('status', S.string())
    .prop('createdAt', S.string().format('date-time'))
    .prop('updatedAt', S.string().format('date-time'));
