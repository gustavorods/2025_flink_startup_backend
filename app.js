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
app.use(cors());

// Middleware para aceitar dadaos JSON
app.use(express.json());

// Importação das rotas
const userRoutes = require('./src/routes/userRoutes');

// Definindo a rota base da API
app.use('/api', userRoutes);

// Rodar servidos
app.listen(port, () => {
    console.log(`API rodando em https://localhost:${port}`);
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
    },
    apis: ['./routes/*.js'], // Caminho para seus arquivos de rota
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
