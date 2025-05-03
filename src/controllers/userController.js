const { createUserInFirestore, getUsersFromFirebase } = require('../models/userModel');
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

module.exports = { createUser, /*getUsers*/ };
