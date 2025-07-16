import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Natours API',
      version: '1.0.0',
      description: 'API documentation for Natours web app'
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'development'
            ? `http://localhost:${process.env.PORT}/api/v1`
            : `${process.env.URL}`
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controller/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
