import S from 'fluent-json-schema';

export const merchantUsersSchema = S.object()
    .prop('id', S.string().format('uuid'))
    .prop('username', S.string())
    .prop('email', S.string().format('email'))
    .prop('password', S.string())
    .prop('isActive', S.boolean())
    .prop('status', S.string())
    .prop('createdAt', S.string().format('date-time'))
    .prop('updatedAt', S.string().format('date-time'))
    .prop('refreshToken', S.string().raw({ nullable: true }));
