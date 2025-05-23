const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');

const multer = require('multer');

// Configuração do Multer para upload de imagens de perfil e posts.
// Armazena os arquivos em memória para serem processados.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/criar-novo-user:
 *   post:
 *     summary: Cria um novo usuário e retorna um token JWT.
 *     description: Recebe os dados do usuário, opcionalmente uma imagem de perfil, cria o usuário no banco de dados, faz upload da imagem para o S3 e retorna um token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: "Arquivo de imagem de perfil (opcional)."
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
router.post('/criar-novo-user', upload.single('profileImage'), userController.createUser);

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

/**
 * @swagger
 * /api/users/{userId}/foto:
 *   get:
 *     summary: Retorna o link da imagem de perfil do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL da imagem retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imagemUrl:
 *                   type: string
 *       400:
 *         description: Parâmetro ausente
 *       404:
 *         description: Imagem não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/users/:userId/foto", userController.buscarImagemUsuario);

/**
 * @swagger
 * /api/users/{userId}/comparar-esportes:
 *   get:
 *     summary: Comparar esportes entre usuários
 *     description: Retorna os IDs de usuários que têm esportes em comum com o usuário especificado.
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário principal
 *     responses:
 *       200:
 *         description: Lista de usuários semelhantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 semelhantes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["user123", "user456"]
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro interno do servidor
 */
router.get("/users/:userId/comparar-esportes", userController.compararEsportes);


/**
 * @swagger
 * /api/users/{id}/alterar:
 *   put:
 *     summary: Atualiza dados do usuário no Firestore
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             example:
 *               nome: "Novo Nome"
 *               sobrenome: "Novo Sobrenome"
 *               esportes: ["futebol", "natação"]
 *               redes_sociais:
 *                 instagram: "novo_insta"
 *               profileImage: null # Envie o arquivo binário aqui se for atualizar a imagem
 *             properties:
 *               nome:
 *                 type: string
 *               sobrenome:
 *                 type: string
 *               esportes:
 *                 type: array # Ou string separada por vírgulas
 *                 items:
 *                   type: string
 *               redes_sociais:
 *                 type: object # Ou string JSON
 *               username:
 *                  type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: "Novo arquivo de imagem de perfil (opcional)."
 *     responses:
 *       200:
 *         description: Dados atualizados com sucesso ou nenhuma alteração detectada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 mensagem: "Dados atualizados com sucesso"
 *       400:
 *         description: Requisição mal formatada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 erro: "ID do usuário é obrigatório"
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 erro: "Erro ao atualizar usuário no Firestore"
 */
router.put('/users/:id/alterar', upload.single('profileImage'), userController.atualizarUsuarioController);


/**
 * @swagger
 * /users/{userId}/pegar-username-id:
 *   get:
 *     summary: Retorna o username de um usuário com base no ID
 *     description: Esta rota busca o username de um usuário fornecendo o `userId`.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID do usuário para buscar o username.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Username encontrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "usuario_exemplo"
 *       404:
 *         description: Usuário não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário não encontrado"
 *       500:
 *         description: Erro no servidor ao buscar o username.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao buscar username com Id {userId}: {erro}"
 */
router.get('/users/:userId/pegar-username-id', userController.buscarUsernameController);

/**
 * @swagger
 * /api/users/{userId}/profile:
 *   get:
 *     summary: Retorna os dados de perfil de um usuário específico.
 *     description: Busca e retorna todos os dados de um usuário (exceto a senha) com base no ID fornecido.
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID do usuário para buscar os dados do perfil.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do perfil do usuário encontrados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "Gn28kPrRMW9IYigM8ky9"
 *                 nome:
 *                   type: string
 *                   example: "Hernandes"
 *                 sobrenome:
 *                   type: string
 *                   example: "Arthur"
 *                 email:
 *                   type: string
 *                   example: "hernandeshass910@gmail.com"
 *                 esportes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Futebol", "Vôlei"]
 *                 # Adicione outros campos que seu usuário possa ter, exceto a senha
 *       400:
 *         description: ID do usuário não fornecido.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/users/:userId/profile', userController.getUserProfileById);

/**
 * @swagger
 * /api/users/{userId}/posts:
 *   get:
 *     summary: Retorna os posts de um usuário específico em ordem cronológica.
 *     description: Busca e retorna todos os posts de um usuário, ordenados do mais recente para o mais antigo.
 *     tags:
 *       - Usuários
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID do usuário para buscar os posts.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Posts do usuário encontrados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "post123"
 *                   userId:
 *                     type: string
 *                     example: "Gn28kPrRMW9IYigM8ky9"
 *                   texto:
 *                     type: string
 *                     example: "Meu primeiro post!"
 *                   createdAt:
 *                     type: string # Ou object se for retornar o Timestamp do Firestore
 *                     format: date-time
 *                     example: "2024-07-30T10:00:00.000Z"
 *       400:
 *         description: ID do usuário não fornecido.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */
router.get('/users/:userId/posts', userController.getUserPostsChronologically);

/**
 * @swagger
 *  :
 *   post:
 *     summary: Cria um novo post para o usuário autenticado
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data: # Changed from application/json
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - image
 *               - sports
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Partida de futebol no parque"
 *               postImage: # Changed from 'image' to 'postImage' and type to binary
 *                 type: string
 *                 format: binary
 *                 description: "Arquivo de imagem do post."
 *               sports:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["futebol", "vôlei"]
 *                 description: "Tags de esportes. Envie múltiplos campos 'sports' para um array (ex: sports=futebol&sports=vôlei) ou um único campo com valores separados por vírgula que será tratado no backend."
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: "ID do post criado."
 *                 message:
 *                   type: string
 *                 description:
 *                   type: string
 *                 image:
 *                   type: string
 *                 sports:
 *                   type: array
 *                   items:
 *                     type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Campos inválidos ou usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/posts', authenticateToken, upload.single('postImage'), userController.createPostController);

module.exports = router;
