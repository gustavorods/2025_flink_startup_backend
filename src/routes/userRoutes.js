const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');

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
/**
 * @swagger
 * /api/listar-users:
 *   get:
 *     summary: Retorna a lista de usuários
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários obtida com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno
 */
router.get('/listar-users', authenticateToken, userController.getAllUsers);

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

/**
 * @swagger
 * /api/seguir:
 *   post:
 *     summary: "Seguir um usuário"
 *     description: "Permite que um usuário siga outro. Verifica se ambos os usuários existem antes de realizar a ação."
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       description: "Dados necessários para seguir um usuário."
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quemSegue:
 *                 type: string
 *                 description: "ID do usuário que está tentando seguir."
 *               quemVaiSerSeguido:
 *                 type: string
 *                 description: "ID do usuário que será seguido."
 *             required:
 *               - quemSegue
 *               - quemVaiSerSeguido
 *     responses:
 *       200:
 *         description: "Usuário seguido com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seguindo com sucesso."
 *       400:
 *         description: "Parâmetros obrigatórios ausentes."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Parâmetros obrigatórios ausentes."
 *       404:
 *         description: "Um ou ambos os usuários não existem."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Um ou ambos os usuários não existem."
 *       500:
 *         description: "Erro interno ao tentar seguir usuário."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno ao tentar seguir usuário."
 * 
 */
router.post("/seguir", userController.seguirUsuario);

module.exports = router;
