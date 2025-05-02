const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Configuração do CORS 
app.use(cors());

// Middleware para aceitar dadaos JSON
app.use(express.json());

// Importação das rotas
const userRoutes = require('./routes/userRoutes');

// Definindo a rota base da API
app.use('/api', userRoutes);

// Rodar servidos
app.listen(port, () => {
    console.log(`API rodando em https://localhost:${port}`);
});