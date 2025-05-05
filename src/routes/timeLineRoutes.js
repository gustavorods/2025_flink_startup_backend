const express = require("express");
const router = express.Router();
const { timeLineController } = require("../controllers/");

/**
 * @swagger
 * /timeline/post/{postId}:
 *   get:
 *     summary: Retorna a imagem, descrição e tags de uma postagem
 *     tags:
 *       - Timeline
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da postagem
 *     responses:
 *       200:
 *         description: Dados da postagem retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imagem:
 *                   type: string
 *                   example: "https://link-da-imagem-do-post.jpg"
 *                 descricao:
 *                   type: string
 *                   example: "Joguei muito vôlei hoje"
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["futebol"]
 *                 fotoPerfil:
 *                   type: string
 *                   example: "https://link-da-imagem-de-perfil.jpg"
 *                 nome:
 *                   type: string
 *                   example: "Hernandes"
 *       400:
 *         description: O ID da postagem não foi fornecido
 *       404:
 *         description: Postagem não encontrada
 */
router.get("/post/:postId", timeLineController.obterDadosDaPostagem);

module.exports = router;
