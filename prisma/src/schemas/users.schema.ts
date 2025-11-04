import S from 'fluent-json-schema';

export const userSchema = S.object()
    .prop('id', S.string().format('uuid'))
    .prop('username', S.string())
    .prop('email', S.string().format('email'))
    .prop('image', S.string().format('uri'))
    .prop('favouriteEvento', S.array().items(S.string()))
    .prop('followingUsers', S.array().items(S.string()))
    .prop('followersCount', S.number())
    .prop('followingCount', S.number())
    .prop('refreshTokens', S.array().items(S.string()))
    .prop('isActive', S.boolean())
    .prop('status', S.string())
    .prop('createdAt', S.string().format('date-time'))
    .prop('updatedAt', S.string().format('date-time'));

export const createUserSchema = {
    body: S.object()
        .prop('username', S.string().required())
        .prop('email', S.string().format('email').required())
        .prop('password', S.string().minLength(8).required())
        .prop('image', S.string().format('uri'))
        .prop('favouriteEvento', S.array().items(S.string()))
        .prop('followingUsers', S.array().items(S.string()))
        .prop('isActive', S.boolean())
        .prop('status', S.string().default('PUBLISHED')),
    response: {
        201: userSchema,
    },
};

export const updateUserSchema = {
    params: S.object().prop('id', S.string().required()),
    body: S.object()
        .prop('username', S.string())
        .prop('email', S.string().format('email'))
        .prop('password', S.string().minLength(8))
        .prop('image', S.string().format('uri'))
        .prop('favouriteEvento', S.array().items(S.string()))
        .prop('followingUsers', S.array().items(S.string()))
        .prop('isActive', S.boolean())
        .prop('status', S.string()),
    response: {
        200: userSchema,
    },
};

export const listUsersSchema = {
    querystring: S.object()
        .prop('q', S.string())
        .prop('page', S.integer().minimum(1))
        .prop('perPage', S.integer().minimum(1))
        .prop('isActive', S.boolean()),
    response: {
        200: S.object()
            .prop('items', S.array().items(userSchema))
            .prop(
                'meta',
                S.object()
                    .prop('page', S.integer())
                    .prop('perPage', S.integer())
                    .prop('total', S.integer())
            ),
    },
};

export const userLoginSchema = {
    body: S.object()
        .prop('email', S.string().format('email').required())
        .prop('password', S.string().required()),
    response: {
        200: S.object()
            .prop('token', S.string())
            .prop('refreshToken', S.string())
            .prop('user', userSchema),
    },
};
