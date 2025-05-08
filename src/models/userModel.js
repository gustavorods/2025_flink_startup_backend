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
    return dados.profileImage || null; // Changed to 'profileImage'
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

// Função que pega os esportes do usuário 
async function pegarEsportesUser(userId) {
  try {
    const docRef = db.collection("users").doc(userId);
    const doc = await docRef.get();

    // Verificando se o documento existe
    if (!doc.exists) {
      return null; // Usuário não encontrado
    } 

    const dados = doc.data();
    return dados.esportes || null // retorna null se o campo não existir
  } catch {
    throw new Error(`Erro ao buscar esportes do usuário com Id ${userId}: ${error.message}`);
  }
}

async function getSeguidos(userId) {
  const snapshot = await db.collection(`users/${userId}/seguindo`).get();
  return snapshot.docs.map(doc => doc.id);
}

/**
 * Atualiza os dados de um usuário no Firestore apenas com os campos alterados
 * @param {string} userId - ID do usuário
 * @param {Object} novosDados - Objeto com os novos dados (parciais ou completos)
 */
async function atualizarUsuarioFirestore(userId, novosDados) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('Usuário não encontrado');
    }

    const dadosAtuais = userDoc.data();
    const dadosParaAtualizar = {};

    // Compara apenas campos que mudaram
    for (const key in novosDados) {
      if (
        novosDados[key] !== undefined && 
        JSON.stringify(novosDados[key]) !== JSON.stringify(dadosAtuais[key])
      ) {
        dadosParaAtualizar[key] = novosDados[key];
      }
    }

    if (Object.keys(dadosParaAtualizar).length === 0) {
      return 'Nenhuma alteração detectada';
    }

    await userRef.update(dadosParaAtualizar);
    return 'Dados atualizados com sucesso';
  } catch (error) {
    console.error('Erro ao atualizar usuário no Firestore:', error.message);
    throw new Error('Erro ao atualizar usuário no Firestore');
  }
}

/**
 * Busca todos os dados de um usuário pelo ID, exceto a senha.
 * @param {string} userId - ID do usuário a ser buscado.
 * @returns {Promise<Object|null>} Objeto com os dados do usuário (sem senha) ou null se não encontrado.
 */
async function getUserDataById(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return null; // Usuário não encontrado
    }

    const userData = userDoc.data();
    delete userData.password; // Remove o campo senha para não expô-lo

    // Ensure the profile image URL is consistent if it exists
    // The field 'profileImage' is now used for the main profile picture.
    // 'fotoPerfil' in post documents will reference this.
    return { id: userDoc.id, ...userData, profileImageUrl: userData.profileImage || null };
  } catch (error) {
    console.error(`Erro ao buscar dados do usuário por ID (${userId}) no Firestore:`, error.message);
    throw new Error('Erro ao buscar dados do usuário no Firestore');
  }
}

/**
 * Busca os posts de um usuário específico, ordenados por data de criação (mais recentes primeiro).
 * @param {string} userId - ID do usuário cujos posts serão buscados.
 * @returns {Promise<Array<Object>>} Array com os posts do usuário.
 */
async function getPostsByUserIdOrdered(userId) {
  try {
    const postsSnapshot = await db.collection('posts')
                                  .where('userId', '==', userId)
                                  .orderBy('created_at', 'desc') // Ordena por 'created_at' em ordem descendente
                                  .get();

    if (postsSnapshot.empty) {
      return []; // Nenhum post encontrado para este usuário
    }

    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return posts;
  } catch (error) {
    console.error(`Erro ao buscar posts do usuário (${userId}) no Firestore:`, error.message);
    throw new Error('Erro ao buscar posts do usuário no Firestore');
  }
}

/**
 * Cria um novo post no Firestore.
 * @param {string} userId - ID do usuário que está criando o post.
 * @param {string} description - Descrição do post.
 * @param {string} imageUrl - URL da imagem do post.
 * @param {Array<string>} sportsArray - Array de esportes relacionados ao post.
 * @returns {Promise<Object>} O objeto do post criado com seu ID.
 */
async function createPostInFirestore(userId, description, imageUrl, sportsArray) {
  try {
    // Buscar nome e fotoPerfil do usuário
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('Usuário criador do post não encontrado.');
    }
    const userData = userDoc.data();
    const nomeUsuario = userData.nome || 'Usuário Anônimo'; // Fallback
    const fotoPerfilUsuario = userData.profileImage || null; // Use 'profileImage' for user's profile pic in post context

    const newPostRef = await db.collection('posts').add({
      userId,
      description,
      image: imageUrl,
      sports: sportsArray,
      nome: nomeUsuario,
      fotoPerfil: fotoPerfilUsuario,
      created_at: Timestamp.now(), // Usa Timestamp do Firestore
    });
    return { id: newPostRef.id, userId, description, image: imageUrl, sports: sportsArray, nome: nomeUsuario, fotoPerfil: fotoPerfilUsuario, created_at: new Date() };
  } catch (error) {
    console.error('Erro ao criar post no Firestore Model:', error.message);
    throw new Error('Erro ao criar post no Firestore');
  }
}

module.exports = {
  createUserInFirestore,
  listUsersFromFirestore,
  findUserByEmail,
  usuarioExiste,
  seguirUsuarioDB,
  buscarImagemUsuarioDB,
  buscarUsernameComId,
  pegarEsportesUser,
  getSeguidos,
  atualizarUsuarioFirestore,
  getUserDataById,
  getPostsByUserIdOrdered,
  createPostInFirestore
};
