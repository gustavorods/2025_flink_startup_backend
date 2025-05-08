const express = require('express');
const multer = require('multer');
const imageController = require('../controllers/imageController');

const router = express.Router();

// Configuração do Multer (armazenamento em memória)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swagger
 * /images/upload/{userId}/{type}:
 *   post:
 *     summary: Faz upload de uma imagem para o perfil ou um post.
 *     description: Upload de imagem para um usuário (perfil) ou post. A imagem é salva no S3 e os dados são armazenados no Firestore.
 *     tags:
 *       - Upload de Imagem
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID do usuário.
 *         schema:
 *           type: string
 *       - name: type
 *         in: path
 *         required: true
 *         description: "Tipo de imagem: \"profile\" ou \"post\"."
 *         schema:
 *           type: string
 *           enum: [profile, post]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               postId:
 *                 type: string
 *                 description: Obrigatório apenas se type for "post"
 *               personName:
 *                 type: string
 *                 description: Nome da pessoa que está postando
 *               userProfileImageUrl:
 *                 type: string
 *                 description: URL da imagem de perfil do usuário
 *               postDescription:
 *                 type: string
 *                 description: Descrição do post
 *               postTags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de esportes ou tags do post
 *     responses:
 *       200:
 *         description: Upload realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: Requisição mal formatada ou parâmetros faltando.
 *       500:
 *         description: Erro interno do servidor ao tentar fazer o upload.
 */
router.post(
  '/upload/:userId/:type',
  upload.single('image'),
  imageController.uploadImageHandler
);

module.exports = router;
