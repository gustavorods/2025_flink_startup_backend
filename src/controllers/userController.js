const { createUserInFirestore, listUsersFromFirestore, findUserByEmail, buscarImagemUsuarioDB } = require('../models/userModel');
const { seguirUsuarioDB, usuarioExiste, atualizarUsuarioFirestore, buscarUsernameComId, getUserDataById } = require("../models/userModel");
const userServices = require("../services/userServices");
const { compararEsportesEntreUsers } = require("../services/userServices");
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userSchema } = require('../schemas/userSchema'); // importa o schema
const { uploadImage } = require('../models/imageModel'); // Import for image upload
const db = require('../config/firebaseConfig'); // Import Firestore instance for generating IDs

// Controller para buscar o username com base no id
const buscarUsernameController = async (req, res) => {
  const { userId } = req.params;

  try {
    // Chamando a função de serviço para buscar o username
    const username = await buscarUsernameComId(userId);

    if (username === null) {
      // Caso o username não seja encontrado, retorna erro 404
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Retorna o username encontrado
    return res.status(200).json({ username });
  } catch (error) {
    // Caso ocorra algum erro, retorna o erro
    return res.status(500).json({ message: error.message });
  }
};

async function atualizarUsuarioController(req, res) {
  const userId = req.params.id;
  const profileImageFile = req.file; // Arquivo da nova imagem de perfil (de multer)
  const requestBody = { ...req.body };

  // Pre-processamento para 'esportes' se presente
  if (requestBody.esportes !== undefined) {
    if (typeof requestBody.esportes === 'string') {
      requestBody.esportes = requestBody.esportes.split(',').map(sport => sport.trim()).filter(sport => sport);
      if (requestBody.esportes.length === 0 && req.body.esportes.trim() !== '') {
          requestBody.esportes = [req.body.esportes.trim()];
      } else if (requestBody.esportes.length === 0 && req.body.esportes.trim() === '') {
          requestBody.esportes = [];
      }
    } else if (!Array.isArray(requestBody.esportes)) {
      // Se não for string nem array, pode ser um erro de formatação, tratar ou remover
      delete requestBody.esportes; // ou retornar erro
    }
  }

  // Pre-processamento para 'redes_sociais' se presente
  if (requestBody.redes_sociais !== undefined) {
    if (typeof requestBody.redes_sociais === 'string') {
      try {
        requestBody.redes_sociais = JSON.parse(requestBody.redes_sociais);
      } catch (e) {
        return res.status(400).json({ errors: [{ path: ['redes_sociais'], message: 'Formato inválido para redes_sociais. Esperado um objeto JSON stringificado.' }] });
      }
    } else if (typeof requestBody.redes_sociais !== 'object' || requestBody.redes_sociais === null) {
        // Se não for string nem objeto válido, tratar ou remover
        delete requestBody.redes_sociais; // ou retornar erro
    }
  }

  // Remover campos vazios ou indefinidos para não sobrescrever com null/undefined desnecessariamente
  // A função atualizarUsuarioFirestore já lida com a comparação, mas é bom limpar aqui.
  const dadosParaAtualizar = {};
  for (const key in requestBody) {
    if (requestBody[key] !== undefined && requestBody[key] !== null && (typeof requestBody[key] !== 'string' || requestBody[key].trim() !== '')) {
      dadosParaAtualizar[key] = requestBody[key];
    }
  }

  try {
    let mensagemResultado = "Nenhuma alteração textual detectada.";

    // 1. Atualizar dados textuais se houver
    if (Object.keys(dadosParaAtualizar).length > 0) {
      const resultadoTextual = await atualizarUsuarioFirestore(userId, dadosParaAtualizar);
      mensagemResultado = resultadoTextual; // Pode ser "Dados atualizados com sucesso" ou "Nenhuma alteração detectada"
    }

    // 2. Se uma nova imagem de perfil foi enviada, faz o upload
    if (profileImageFile) {
      try {
        await uploadImage(userId, null, profileImageFile, 'profile', {});
        console.log(`Nova imagem de perfil para o usuário ${userId} processada.`);
        // Se a mensagem anterior era "Nenhuma alteração detectada", atualiza para indicar que a imagem mudou.
        if (mensagemResultado === "Nenhuma alteração detectada." || mensagemResultado === "Nenhuma alteração textual detectada.") {
            mensagemResultado = "Imagem de perfil atualizada com sucesso.";
        } else if (mensagemResultado === "Dados atualizados com sucesso") {
            mensagemResultado = "Dados e imagem de perfil atualizados com sucesso.";
        }
      } catch (uploadError) {
        console.error(`Erro ao fazer upload da nova imagem de perfil para ${userId}:`, uploadError.message);
        // Decide como lidar com o erro de upload. Pode adicionar ao resultado ou retornar erro separado.
        // Por enquanto, se os dados textuais foram atualizados, o sucesso deles prevalece.
        return res.status(500).json({ erro: `Dados textuais podem ter sido atualizados, mas houve erro ao salvar a nova imagem de perfil: ${uploadError.message}` });
      }
    }

    return res.status(200).json({ mensagem: mensagemResultado });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

// Função para seguir outro usuário verificando a existência dos usuários
async function seguirUsuario(req, res) {
  const { quemSegue, quemVaiSerSeguido } = req.body;

  if (!quemSegue || !quemVaiSerSeguido) {
    return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
  }

  try {
    // Verificações
    const existeQuemSegue = await usuarioExiste(quemSegue);
    if (!existeQuemSegue) {
      return res.status(404).json({ error: "O usuário que está tentando seguir não existe." });
    }

    const existeQuemVaiSerSeguido = await usuarioExiste(quemVaiSerSeguido);
    if (!existeQuemVaiSerSeguido) {
      return res.status(404).json({ error: "O usuário que está sendo seguido não existe." });
    }

    console.log(`Tentando seguir: ${quemSegue} -> ${quemVaiSerSeguido}`);
    await seguirUsuarioDB(quemSegue, quemVaiSerSeguido);
    console.log("Usuário seguido com sucesso.");
    res.status(200).json({ message: "Seguindo com sucesso." });
  } catch (error) {
    console.error("Erro ao seguir usuário:", error.message);
    res.status(500).json({ error: "Erro interno ao tentar seguir usuário." });
  }
}

// Função para criar um novo usuário
const createUser = async (req, res) => {
  const requestBody = { ...req.body };

  // Pre-processamento para 'esportes'
  if (requestBody.esportes && typeof requestBody.esportes === 'string') {
    // Tenta dividir por vírgula, ou trata como array de um elemento se não houver vírgula
    requestBody.esportes = requestBody.esportes.split(',').map(sport => sport.trim()).filter(sport => sport);
    if (requestBody.esportes.length === 0 && req.body.esportes.trim() !== '') { // Caso de string única sem vírgula
        requestBody.esportes = [req.body.esportes.trim()];
    } else if (requestBody.esportes.length === 0 && req.body.esportes.trim() === '') {
        requestBody.esportes = []; // String vazia resulta em array vazio
    }
  } else if (requestBody.esportes === undefined) {
    requestBody.esportes = []; // Se não enviado, Zod schema (se optional) tratará ou falhará se requerido
  }

  // Pre-processamento para 'redes_sociais'
  if (requestBody.redes_sociais && typeof requestBody.redes_sociais === 'string') {
    try {
      requestBody.redes_sociais = JSON.parse(requestBody.redes_sociais);
    } catch (e) {
      return res.status(400).json({ errors: [{ path: ['redes_sociais'], message: 'Formato inválido para redes_sociais. Esperado um objeto JSON stringificado.' }] });
    }
  } else if (requestBody.redes_sociais === undefined) {
    requestBody.redes_sociais = {}; // Se não enviado, Zod schema (se optional) tratará ou falhará se requerido
  }

  // Validação dos dados com Zod
  const parsed = userSchema.safeParse(requestBody);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }
  const { nome, sobrenome, email, password, esportes, redes_sociais, username } = parsed.data;
  const profileImageFile = req.file; // Arquivo da imagem de perfil (de multer)

  try {
    // Cria usuário no Firestore
    let userId;
    try {
      userId = await createUserInFirestore(nome, sobrenome, email, password, esportes, redes_sociais, username);
    } catch (err) {
      console.error('Erro ao criar usuário no Firestore Controller:', err);
      return res.status(500).send('Erro ao criar usuário no Firestore Controller');
    }

    // Se uma imagem de perfil foi enviada, faz o upload
    if (profileImageFile) {
      try {
        // Chama a função de upload do imageModel
        // postId é null, type é 'profile', postDetails é {}
        await uploadImage(userId, null, profileImageFile, 'profile', {});
        console.log(`Imagem de perfil para o usuário ${userId} processada.`);
      } catch (uploadError) {
        console.error(`Erro ao fazer upload da imagem de perfil para ${userId}:`, uploadError.message);
        // Decide se o erro de upload de imagem deve impedir a criação do usuário ou apenas logar.
        // Por enquanto, apenas loga e continua, o usuário é criado sem imagem de perfil.
        // Se for crítico, pode retornar um erro aqui:
        // return res.status(500).send('Usuário criado, mas houve erro ao salvar a imagem de perfil.');
      }
    }

    // Verifica se a chave JWT_SECRET está configurada

    if (!process.env.JWT_SECRET) {
      return res.status(500).send('JWT_SECRET não configurado');
    }

    // Cria o token JWT
    let token;
    try {
      token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    } catch (err) {
      console.error('Erro ao criar o token JWT:', err);
      return res.status(500).send('Erro ao criar o token JWT');
    }

    // Retorna o token gerado
    res.status(201).send({ token });
  } catch (err) {
    console.error('Erro inesperado:', err);
    res.status(500).send('Erro ao criar usuário');
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET não configurado.' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Erro ao realizar login:', err);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
};

// Função para listar todos os usuários
const getAllUsers = async (req, res) => {
  try {
    const users = await listUsersFromFirestore();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

/**
 * Controller para retornar a imagem do perfil do usuário
 */
async function buscarImagemUsuario(req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Parâmetro userId é obrigatório." });
  }

  try {
    const imagemUrl = await buscarImagemUsuarioDB(userId);

    if (!imagemUrl) {
      return res.status(404).json({ error: "Imagem não encontrada para este usuário." });
    }

    return res.status(200).json({ imagemUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Controller que compara os esportes de um usuário com os de outros
 */
const compararEsportes = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Busca todos os usuários
    const users = await listUsersFromFirestore();

    // Encontra o usuário principal
    const userPrincipal = users.find(user => user.id === userId);

    if (!userPrincipal) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Chama o service para comparar os esportes
    const semelhantes = await compararEsportesEntreUsers(userId, userPrincipal.esportes);

    // Retorna os usuários semelhantes
    res.status(200).json({ semelhantes });
  } catch (error) {
    console.error("Erro ao comparar esportes:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

/**
 * @description Busca e retorna os dados de um usuário pelo ID.
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
const getUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
    }

    const userData = await userServices.fetchUserDataById(userId);

    if (!userData) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error('Erro no controller ao buscar perfil do usuário:', error.message);
    res.status(500).json({ message: 'Erro interno ao buscar dados do usuário.', error: error.message });
  }
};

const getUserPostsChronologically = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
    }

    const posts = await userServices.fetchUserPostsChronologically(userId); // Certifique-se que userServices está acessível

    // Se o usuário não for encontrado (verificado no service), o service já lança um erro.
    // Se o usuário existe mas não tem posts, a função do model retorna um array vazio.
    res.status(200).json(posts);

  } catch (error) {
    console.error('Erro no controller ao buscar posts do usuário:', error.message);
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(500).json({ message: 'Erro interno ao buscar posts do usuário.', error: error.message });
  }
};

const createPostController = async (req, res) => {
  try {
    const userId = req.user.userId; // From authenticateToken middleware

    console.log('User ID from token:', userId); // Debug log to check userId
    console.log('Request body:', req.body); // Debug log to check request body
    
    const file = req.file; // From multer middleware (upload.single('postImage'))
    const { description } = req.body;
    let { sports } = req.body; // Can be a string or array from form-data

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!file) {
      return res.status(400).json({ message: 'Nenhuma imagem foi enviada. O campo "postImage" é obrigatório.' });
    }

    if (!description) {
      return res.status(400).json({ message: 'O campo "description" é obrigatório.' });
    }

    // Handle sports: ensure it's an array
    let sportsArray = [];
    if (sports) {
      if (Array.isArray(sports)) {
        sportsArray = sports;
      } else if (typeof sports === 'string') {
        sportsArray = sports.split(',').map(s => s.trim()).filter(s => s);
         if (sportsArray.length === 0 && sports.trim() !== '') {
            sportsArray = [sports.trim()];
        }
      }
    }
    // if (sportsArray.length === 0) { // Decide if sports are mandatory
    //   return res.status(400).json({ message: 'O campo "sports" é obrigatório e deve conter pelo menos uma tag.' });
    // }

    // Generate a unique ID for the post (used for S3 key and Firestore document ID)
    const postId = db.collection('posts').doc().id;

    // Fetch user's name and profile picture to include in the post details
    const userData = await getUserDataById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'Usuário criador do post não encontrado.' });
    }

    const postDetails = {
      personName: userData.nome,
      userProfileImageUrl: userData.profileImageUrl, // This comes from getUserDataById which reads 'profileImage'
      postDescription: description,
      postTags: sportsArray
    };

    const imageUrl = await uploadImage(userId, postId, file, 'post', postDetails);

    res.status(201).json({ message: 'Post criado com sucesso!', id: postId, imageUrl, description, sports: sportsArray, userId, nome: userData.nome, fotoPerfil: postDetails.userProfileImageUrl });

  } catch (error) {
    console.error('Erro no controller ao criar post:', error.message);
    if (error.message.includes('obrigatório') || error.message.includes('Usuário criador do post não encontrado')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro interno ao criar post.', error: error.message });
  }
};


module.exports = {
  createUser,
  getAllUsers,
  loginUser,
  seguirUsuario,
  buscarImagemUsuario,
  compararEsportes,
  atualizarUsuarioController,
  buscarUsernameController,
  getUserProfileById,
  getUserPostsChronologically,
  createPostController
};
