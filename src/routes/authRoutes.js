const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');

/**
 * @swagger
 * /auth/verify-token:
 *   get:
 *     summary: Verifica a validade de um token JWT
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "abc123"
 *       '401':
 *         description: Token inválido, expirado ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token inválido ou expirado.
 *       '500':
 *         description: Erro interno no servidor
 */
router.get('/verify-token', authController.verifyToken);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verifica se um e-mail já está cadastrado no sistema.
 *     tags:
 *       - Usuários
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@exemplo.com
 *     responses:
 *       200:
 *         description: Retorna se o e-mail existe ou não no banco de dados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 existe:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Erro de validação (e-mail não enviado).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email é obrigatório.
 *       500:
 *         description: Erro interno ao verificar o e-mail.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro interno ao verificar email.
 */
router.post('/verify-email', authController.verificarEmail);

module.exports = router;