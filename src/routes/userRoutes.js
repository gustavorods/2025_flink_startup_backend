const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rota para criar um novo usuário
/**
 * @swagger
 * /api/createUser:
 *   post:
 *     summary: Cria um novo usuário e retorna um token JWT.
 *     description: Recebe o e-mail e senha do usuário, cria o usuário no banco de dados e retorna um token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'usuario@exemplo.com'
 *               password:
 *                 type: string
 *                 example: 'senhaForte123'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso e token JWT gerado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZXhwIjoxNjI2ODQwNDAwfQ.Xw6A3_P9CqfQdb1VAlUHVZNN6q_hIs2Fzkhj2T_1M8M'
 *       400:
 *         description: Email ou senha não informados.
 *       500:
 *         description: Erro interno ao criar o usuário ou gerar o token JWT.
 */
router.post('/criar-novo-user', userController.createUser);

// Rota para listar todos os usuários
/**
 * @swagger
 * /api/listar-users:
 *   get:
 *     summary: Retorna a lista de usuários
 *     responses:
 *       200:
 *         description: Lista de usuários obtida com sucesso
 */
router.get('/listar-users', userController.getUsers);

// Rota para fazer login do usuário
/**
 * @swagger
 * paths:
 *   /api/login:
 *     post:
 *       summary: Realiza o login do usuário
 *       tags:
 *         - Autenticação
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: usuario@email.com
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: senha123
 *               required:
 *                 - email
 *                 - password
 *       responses:
 *         '200':
 *           description: Login bem-sucedido
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   token:
 *                     type: string
 *                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         '400':
 *           description: Credenciais inválidas ou erro ao autenticar
 *           content:
 *             application/json:
 *               schema:
 *                 type: string
 *                 example: Credenciais inválidas
 *         '500':
 *           description: Erro interno no servidor
 */
router.post('/login', userController.loginUser);

module.exports = router;
