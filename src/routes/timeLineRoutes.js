const express = require("express");
const router = express.Router();
const { obterImagemDoPost, timeLineController } = require("../controllers/");

/**
 * @swagger
 * /timeline/post/{postId}/imagem:
 *   get:
 *     summary: Retorna a imagem da postagem
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
 *         description: URL da imagem retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imagem:
 *                   type: string
 *                   example: "https://link-da-imagem.jpg"
 *       400:
 *         description: postId ausente
 *       404:
 *         description: Postagem não encontrada ou sem imagem
 */
router.get("/post/:postId/imagem", timeLineController.obterImagemDoPost);

module.exports = router;
