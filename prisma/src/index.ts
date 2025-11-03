import Fastify from 'fastify';
import adminRoutes from './routes/admin.routes';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';

const fastify = Fastify({
  logger: true
});

// Register CORS
fastify.register(cors, {
  origin: '*' // For development, allow all origins. Restrict in production.
});

// Register Rate Limit
fastify.register(rateLimit, {
  max: 100, // Max requests per windowMs
  timeWindow: '1 minute' // Time window
});

// Register Helmet
fastify.register(helmet);

// Swagger
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'API Documentation',
      description: 'API documentation for our Fastify application.',
      version: '1.0.0'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    host: 'localhost:3002',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your bearer token in the format \"Bearer <token>\"'
      }
    },
    security: [
      {
        Bearer: []
      }
    ]
  }
});

fastify.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
});

fastify.register(adminRoutes);

// Centralized Error Handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error); // Log the error for debugging

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Handle specific error types if needed
  if (error.validation) {
    statusCode = 400;
    message = 'Validation Error';
  }

  reply.status(statusCode).send({ error: message });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3002 });
    const address = fastify.server.address();
    const port = typeof address === 'object' && address !== null ? address.port : 3002;
    fastify.log.info(`Servidor escuchando en ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
