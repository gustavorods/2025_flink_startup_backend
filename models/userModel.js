const db = require('../config/firebaseConfig');  // Importa a conexão com o Firestore

// Função para criar um novo usuário
const createUser = async (userData) => {
  try {
    const docRef = await db.collection('users').add(userData);
    return docRef.id;  // Retorna o ID do documento recém-criado
  } catch (error) {
    throw new Error('Erro ao criar usuário: ' + error.message);
  }
};

// Função para obter todos os usuários
const getUsers = async () => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => doc.data());
    return users;
  } catch (error) {
    throw new Error('Erro ao obter usuários: ' + error.message);
  }
};

module.exports = { createUser, getUsers };
