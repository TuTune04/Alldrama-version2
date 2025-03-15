import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alldrama API Documentation',
      version: '1.0.0',
      description: 'API documentation cho Alldrama Backend',
      contact: {
        name: 'Alldrama Team',
        url: 'https://alldrama.tech',
        email: 'support@alldrama.tech'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server'
      },
      {
        url: 'https://api.alldrama.tech',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'], // paths to files containing annotations
};

export const swaggerSpec = swaggerJsdoc(options); 