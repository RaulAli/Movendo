import S from 'fluent-json-schema';

export const eventoSchema = S.object()
  .prop('id', S.string().format('uuid'))
  .prop('nombre', S.string())
  .prop('ciudad', S.string())
  .prop('slug', S.string())
  .prop('image', S.array().items(S.string().format('uri')))
  .prop('category', S.string())
  .prop('price', S.number())
  .prop('startDate', S.string().format('date-time'))
  .prop('endDate', S.string().format('date-time'))
  .prop('authorId', S.string().format('uuid'))
  //
  .prop('id_merchant', S.array().items(S.string().format('uri')))
  //
  .prop('stock', S.number())
  // 
  .prop('isActive', S.boolean())
  .prop('createdAt', S.string().format('date-time'))
  .prop('updatedAt', S.string().format('date-time'));

export const createEventoSchema = {
  body: S.object()
    .prop('nombre', S.string().required())
    .prop('ciudad', S.string())
    .prop('slug', S.string().required())
    .prop('image', S.array().items(S.string().format('uri')).required())
    //
    .prop('id_merchant', S.array().items(S.string().format('uri')))
    //
    .prop('stock', S.number())
    // 
    .prop('category', S.string())
    .prop('price', S.number())
    .prop('startDate', S.string().format('date-time'))
    .prop('endDate', S.string().format('date-time'))
    .prop('authorId', S.string().format('uuid').required()),

  response: {
    201: eventoSchema,
  },
};
