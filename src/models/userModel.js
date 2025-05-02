const db = require('../config/firebaseConfig');  // Importa a conexão com o Firestore
const bcrypt = require('bcrypt');

// Função para criar um novo usuário
const createUserInFirestore = async (email, password) => {
  try {
    // Verifica se o email já existe
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      throw new Error('Usuário já existe');
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salva o usuário no Firestore
    const newUserRef = await db.collection('users').add({ email, password: hashedPassword });

    return newUserRef.id;
  } catch (error) {
    console.error('Erro ao criar usuário no Firestore Model:', error);
    throw new Error('Erro ao criar usuário no Firestore Model');
  }
};

// Função para obter todos os usuários
const getUsersFromFirebase = async () => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => doc.data());
    return users;
  } catch (error) {
    throw new Error('Erro ao obter usuários: ' + error.message);
  }
};


module.exports = { createUserInFirestore, getUsersFromFirebase };
