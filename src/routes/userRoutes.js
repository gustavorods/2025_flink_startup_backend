const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @swagger
 * /api/criar-novo-user:
 *   post:
 *     summary: Cria um novo usuário e retorna um token JWT.
 *     description: Recebe os dados do usuário, cria o usuário no banco de dados e retorna um token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: 'Gustavo'
 *               sobrenome:
 *                 type: string
 *                 example: 'Leite'
 *               email:
 *                 type: string
 *                 example: 'gustavo@email.com'
 *               password:
 *                 type: string
 *                 example: 'senhaForte123'
 *               username:
 *                 type: string
 *                 example: 'gusta17'
 *               esportes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['futebol', 'natação']
 *               redes_sociais:
 *                 type: object
 *                 properties:
 *                   tiktok:
 *                     type: string
 *                     example: '@gustavo_tk'
 *                   instagram:
 *                     type: string
 *                     example: '@gustavo_ig'
 *                   x:
 *                     type: string
 *                     example: '@gustavo_x'
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
 *         description: Email ou senha não informados ou dados inválidos.
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
// router.get('/listar-users', userController.getUsers);

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
 *               required:
 *                 - email
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: usuario@exemplo.com
 *                 password:
 *                   type: string
 *                   example: senha123
 *       responses:
 *         '200':
 *           description: Login realizado com sucesso
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   token:
 *                     type: string
 *                     description: Token JWT para autenticação
 *                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         '400':
 *           description: Requisição inválida (faltando email ou senha)
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: Email e senha são obrigatórios.
 *         '401':
 *           description: Falha de autenticação (usuário não encontrado ou senha incorreta)
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: Usuário não encontrado.
 *         '500':
 *           description: Erro interno do servidor
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: Erro interno ao realizar login.
 */

/**
 * Rota para o login do usuário
 */
router.post('/login', userController.loginUser);


module.exports = router;
