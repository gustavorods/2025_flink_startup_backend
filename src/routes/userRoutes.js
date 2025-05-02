const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rota para criar um novo usuário
/**
 * @swagger
 * /criar-novo-user:
 *   post:
 *     summary: Cria um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               senha:
 *                 type: string
 *                 example: 123 (deve enviar o hash)
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro de validação nos dados enviados
 */
router.post('/criar-novo-user', userController.createUser);

// Rota para listar todos os usuários
/**
 * @swagger
 * /listar-users:
 *   get:
 *     summary: Retorna a lista de usuários
 *     responses:
 *       200:
 *         description: Lista de usuários obtida com sucesso
 */
router.get('/listar-users', userController.getUsers);

module.exports = router;
