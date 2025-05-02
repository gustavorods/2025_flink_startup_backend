const express = require('express');
const router = express.Router();

// Teste com uma lista de usuários (simulação)
router.get('/users', (req, res) => {
    const users = [
        {id: 1, nome: 'Gustavo Rodrigues'},
        {id: 2, nome: 'Ananda Holanda'},
    ];

    res.json(users); // transformar em JSON
});

module.exports = router;

