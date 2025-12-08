import S from 'fluent-json-schema';

export const paymentSchema = S.object()
  .prop('id', S.string())
  .prop('orderId', S.anyOf([S.string(), S.null()]))
  .prop('amount', S.integer())
  .prop('currency', S.string().minLength(3).maxLength(3))
  .prop('method', S.anyOf([S.string(), S.null()]))
  .prop('status', S.string().enum(['PUBLISHED', 'PENDING', 'SHAVED']))
  .prop('paymentIntentId', S.anyOf([S.string(), S.null()]))
  .prop('clientSecret', S.anyOf([S.string(), S.null()]))
  .prop('createdAt', S.string().format('date-time'))
  .prop('paidAt', S.anyOf([S.string().format('date-time'), S.null()]));

export const createPaymentSchema = {
  body: S.object()
    .prop('orderId', S.string())
    .prop('amount', S.integer().required())
    .prop('currency', S.string().minLength(3).maxLength(3).default('eur'))
    .prop('method', S.string())
    .prop(
      'items',
      S.array().items(
        S.object()
          .prop('id_evento', S.string().required())
          .prop('cantidad', S.integer().required())
      )
    )
    .additionalProperties(false),

  response: {
    201: S.object()
      .prop('paymentId', S.string())
      .prop('clientSecret', S.anyOf([S.string(), S.null()])),
  },
};

export const getPaymentSchema = {
  params: S.object().prop('id', S.string().required()),
  response: {
    200: paymentSchema,
  },
};

export const webhookSchema = {
  // Fluent-json-schema no tiene S.any(); usamos anyOf con los tipos JSON
  body: S.anyOf([
    S.object(),
    S.string(),
    S.array(),
    S.number(),
    S.boolean(),
    S.null()
  ]),
  response: {
    200: S.object().prop('received', S.boolean()),
  },
};

export default {
  paymentSchema,
  createPaymentSchema,
  getPaymentSchema,
  webhookSchema,
};
