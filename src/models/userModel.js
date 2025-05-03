const db = require('../config/firebaseConfig');  // Importa a conexão com o Firestore
const bcrypt = require('bcrypt');

// Função para criar um novo usuário
const createUserInFirestore = async (nome, sobrenome, email, password, esportes, redes_sociais, username) => {
  try {
    // Verifica se o email já existe
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      throw new Error('Usuário já existe');
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salva o usuário no Firestore com todos os dados
    const newUserRef = await db.collection('users').add({
      nome,
      sobrenome,
      email,
      password: hashedPassword,
      esportes,
      redes_sociais,
      username,
      created_at: new Date()
    });

    return newUserRef.id;
  } catch (error) {
    console.error('Erro ao criar usuário no Firestore Model:', error.message);
    throw new Error('Erro ao criar usuário no Firestore Model');
  }
};

// Função para listar todos os usuários
const listUsersFromFirestore = async () => {
  try {
    const snapshot = await db.collection('users').get();

    if (snapshot.empty) {
      return []; // Nenhum usuário encontrado
    }

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      password: undefined // remove a senha por segurança
    }));

    return users;
  } catch (error) {
    console.error('Erro ao listar usuários do Firestore:', error.message);
    throw new Error('Erro ao listar usuários do Firestore');
  }
};


const findUserByEmail = async (email) => {
  const userQuery = await db.collection('users').where('email', '==', email).limit(1).get();
  if (userQuery.empty) return null;

  const userDoc = userQuery.docs[0];
  return {
    id: userDoc.id,
    ...userDoc.data()
  };
};


module.exports = { createUserInFirestore, listUsersFromFirestore, findUserByEmail };
