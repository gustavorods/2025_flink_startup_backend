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
  origin: 'https://flink-frontend-681c1ade16f22bfbb3b12faa.tcloud.site/', // URL do seu frontend React
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para aceitar dadaos JSON
app.use(express.json());

// Importação unificada das rotas
const { userRoutes, authRoutes, timeLineRoutes } = require('./src/routes');

// Definindo a rota base da API
app.use('/api', userRoutes);
app.use('/auth', authRoutes);
app.use('/timeline', timeLineRoutes);

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