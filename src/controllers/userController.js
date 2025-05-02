const { createUserInFirestore, getUsersFromFirebase } = require('../models/userModel');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Função para criar um novo usuário
const createUser = async (req, res) => {
  const { email, password } = req.body;

  // Verifica se o email e a senha foram passados
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    // Chama a função para criar o usuário
    let userId;
    try {
      userId = await createUserInFirestore(email, password);
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


// Função para listar todos os usuários
const getUsers = async (req, res) => {
  try {
    const users = await userModel.getUsersFromFirebase();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   // Verifica se o email e senha são válidos
//   try {
//     // Verifique a senha e o e-mail no Firebase Auth ou em sua base de dados
//     const userRecord = await admin.auth().getUserByEmail(email);

//     // Suponha que você tenha armazenado a senha de forma criptografada
//     const passwordMatch = await bcrypt.compare(password, userRecord.password);
//     if (!passwordMatch) return res.status(400).send('Credenciais inválidas');

//     // Gerando o token JWT
//     const token = jwt.sign({ userId: userRecord.uid }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     res.status(200).send({ token });
//   } catch (error) {
//     console.error(error);
//     res.status(400).send('Erro ao autenticar');
//   }
//   console.log('Email:', email);
//   console.log('Password:', password);

// }

module.exports = { createUser, getUsers };
