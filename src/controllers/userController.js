const { createUserInFirestore, listUsersFromFirestore, findUserByEmail } = require('../models/userModel');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userSchema } = require('../schemas/userSchema'); // importa o schema


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


module.exports = { createUser, getAllUsers,loginUser };
