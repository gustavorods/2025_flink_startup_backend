const db = require('../config/firebaseConfig');  // Importa a conexão com o Firestore
const { Timestamp } = require('firebase-admin').firestore;
const bcrypt = require('bcrypt');

// Função para seguir um usuário
async function seguirUsuarioDB(quemSegue, quemVaiSerSeguido) {
  const timestamp = Timestamp.now();

  const seguindoRef = db
    .collection("users")
    .doc(quemSegue)
    .collection("seguindo")
    .doc(quemVaiSerSeguido);

  const seguidoresRef = db
    .collection("users")
    .doc(quemVaiSerSeguido)
    .collection("seguidores")
    .doc(quemSegue);

  await Promise.all([
    seguindoRef.set({ seguido_em: timestamp }),
    seguidoresRef.set({ seguido_em: timestamp }),
  ]);
}

// Função para verificar se o usuário existe
async function usuarioExiste(uid) {
  const userDoc = await db.collection("users").doc(uid).get();
  return userDoc.exists;
}

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

/**
 * Busca o link da imagem de perfil do usuário no Firestore
 * @param {string} userId - ID do usuário
 * @returns {Promise<string|null>} - URL da imagem ou null se não existir
 */
async function buscarImagemUsuarioDB(userId) {
  try {
    const docRef = db.collection("users").doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null; // Usuário não encontrado
    }

    const dados = doc.data();
    return dados.fotoPerfil || null; // Retorna null se o campo não existir
  } catch (error) {
    throw new Error(`Erro ao buscar imagem do usuário: ${error.message}`);
  }
}

// Função para buscar o username dela com base no id 
async function buscarUsernameComId(userId) {
    try {
        const docRef = db.collection("users").doc(userId);
        const doc = await docRef.get();

        // Verificando se o documento existe
        if (!doc.exists) {
          return null; // Usuário não encontrado
        } 

        const dados = doc.data();
        return dados.username || null; // retorna null se o campo não existir 
    }
    catch (error) {
      throw new Error(`Erro ao buscar username com Id ${userId}: ${error.message}`)
    }
}

module.exports = { createUserInFirestore, listUsersFromFirestore, findUserByEmail, usuarioExiste, seguirUsuarioDB, buscarImagemUsuarioDB, buscarUsernameComId };
