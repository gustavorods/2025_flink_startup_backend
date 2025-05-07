const { createUserInFirestore, listUsersFromFirestore, findUserByEmail, buscarImagemUsuarioDB } = require('../models/userModel');
const { seguirUsuarioDB, usuarioExiste, atualizarUsuarioFirestore, buscarUsernameComId } = require("../models/userModel");
const userServices = require("../services/userServices");
const { compararEsportesEntreUsers } = require("../services/userServices");
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userSchema } = require('../schemas/userSchema'); // importa o schema

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
  const novosDados = req.body;

  try {
    const resultado = await atualizarUsuarioFirestore(userId, novosDados);
    return res.status(200).json({ mensagem: resultado });
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
  // Validação dos dados com Zod
  const parsed = userSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }

  // Dados validados com sucesso
  const { nome, sobrenome, email, password, esportes, redes_sociais, username } = parsed.data;

  try {
    // Cria usuário no Firestore
    let userId;
    try {
      userId = await createUserInFirestore(nome, sobrenome, email, password, esportes, redes_sociais, username);
    } catch (err) {
      console.error('Erro ao criar usuário no Firestore Controller:', err);
      return res.status(500).send('Erro ao criar usuário no Firestore Controller');
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
    const userId = req.user.userId; 
    const { description, image, sports } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!description || !sports) {
      return res.status(400).json({ message: 'Campos description, image e sports são obrigatórios.' });
    }
    if (!Array.isArray(sports)) {
      return res.status(400).json({ message: 'O campo sports deve ser um array.' });
    }

    const novoPost = await userServices.createNewPost(userId, description, image, sports);
    res.status(201).json(novoPost);

  } catch (error) {
    console.error('Erro no controller ao criar post:', error.message);
    if (error.message.includes('Dados inválidos') || error.message.includes('Usuário criador do post não encontrado')) {
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
