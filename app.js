// Express
const express = require('express');
const app = express();
// CORS
const cors = require('cors');
// Porta
const port = 3000;
// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');


// Configuração do CORS
app.use(cors({
  origin: ['https://frontendflinkdeploy-681ced702be4cc96a8c0a742.tcloud.site', 'https://2025-flink-startup-frontend-5894yo0jt.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Middleware para aceitar dadaos JSON
app.use(express.json());

// Importação unificada das rotas
const { userRoutes, authRoutes, timeLineRoutes, imageRoutes } = require('./src/routes');

// Definindo a rota base da API
app.use('/api', userRoutes);
app.use('/auth', authRoutes);
app.use('/timeline', timeLineRoutes);
app.use('/images', imageRoutes);

// Rodar servidos
app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
});

// Configuração básica do Swagger
const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Flink API',
        version: '1.0.0',
        description: 'Documentação sobre as rotas',
      },
      servers: [ 
        {
          url: `http://localhost:${port}`,
          description: 'Servidor de Desenvolvimento Local'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: "Insira o token JWT no formato: Bearer {token}"
          }
        }
      }
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));