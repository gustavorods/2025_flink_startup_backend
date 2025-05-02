const userModel = require('../models/userModel');

// Função para criar um novo usuário
const createUser = async (req, res) => {
  const { email, senha } = req.body; // Obtém os dados do corpo da requisição

  try {
    const newUser = { email, senha };
    const userId = await userModel.createUser(newUser);
    res.status(201).json({ message: 'Usuário criado com sucesso', userId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Função para listar todos os usuários
const getUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, getUsers };
