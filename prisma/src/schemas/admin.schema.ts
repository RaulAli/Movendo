import S from 'fluent-json-schema';

export const adminSchema = S.object()
  .prop('id', S.string().format('uuid'))
  .prop('username', S.string())
  .prop('email', S.string().format('email'))
  .prop('image', S.string().format('uri'))
  .prop('isActive', S.boolean())
  .prop('createdAt', S.string().format('date-time'))
  .prop('updatedAt', S.string().format('date-time'));

export const createAdminSchema = {
  body: S.object()
    .prop('username', S.string().required())
    .prop('email', S.string().format('email').required())
    .prop('password', S.string().minLength(8).required())
    .prop('image', S.string().format('uri')),
  response: {
    201: adminSchema,
  },
};

export const adminLoginSchema = {
  body: S.object()
    .prop('email', S.string().format('email').required())
    .prop('password', S.string().required()),
  response: {
    200: S.object().prop('token', S.string()),
  },
};
