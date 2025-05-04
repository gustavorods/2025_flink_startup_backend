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

module.exports = router;