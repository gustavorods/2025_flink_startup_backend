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

/**
 * @swagger
 * /timeline/feed/{userId}:
 *   get:
 *     summary: Retorna o feed com postagens dos usuários seguidos
 *     tags: [Feed]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário logado (que está buscando o feed)
 *     responses:
 *       200:
 *         description: Lista de postagens recentes dos usuários seguidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID do post
 *                   description:
 *                     type: string
 *                     description: Texto do post
 *                   image:
 *                     type: string
 *                     description: URL da imagem ou vídeo
 *                   sports:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Esportes relacionados ao post
 *                   userId:
 *                     type: string
 *                     description: ID do autor do post
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Data e hora de criação do post
 *       400:
 *         description: userId não informado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/feed/:userId", timeLineController.getFeed);

module.exports = router;
