// Importa o model que acessa o banco
const { listUsersFromFirestore, getSeguidos, getUserDataById, getPostsByUserIdOrdered, createPostInFirestore } = require("../models/userModel");

/**
 * Compara os esportes do usuário principal com os demais usuários
 * @param {string} userId - ID do usuário principal
 * @param {Array} esportesUserPrincipal - Array com os esportes do usuário principal
 * @returns {Array} Lista de objetos dos usuários com esportes em comum
 */
async function compararEsportesEntreUsers(userId, esportesUserPrincipal) {
    // Busca todos os usuários cadastrados
    const [users, quemUserPrincipalSegueArray] = await Promise.all([
        listUsersFromFirestore(),
        getSeguidos(userId) // Busca quem o usuário principal segue
    ]);
    
    // console.log("quemUserPrincipalSegue (IDs da subcoleção):", quemUserPrincipalSegueArray);
    
    // Lista de usuários com esportes em comum
    let usuariosSemelhantes = [];

    // Percorre todos os usuários para comparar os esportes
    for (let i = 0; i < users.length; i++) {
        const esportesUsuario = users[i].esportes;

        // Verifica se o ID do usuário não é o mesmo que o do usuário principal
        if (users[i].id === userId) {
            continue;  // Pula o próprio usuário
        }
        
        // Verifica se o usuário principal já segue este usuário
        const jaSegue = quemUserPrincipalSegueArray.includes(users[i].id);
        // console.log("jaSegue", jaSegue);

        // Verifica se há ao menos um esporte em comum
        const temEsporteEmComum = esportesUsuario.some(esporte =>
            esportesUserPrincipal.includes(esporte)
        );

        // Se houver esporte em comum E o usuário principal NÃO seguir este usuário, adiciona o usuário completo na lista
        if (temEsporteEmComum && !jaSegue) {
            usuariosSemelhantes.push(users[i]);
        }
    }
    // console.log(usuariosSemelhantes);
    return usuariosSemelhantes;
}

/**
 * Busca os dados de um usuário específico pelo ID.
 * @param {string} userId - O ID do usuário a ser buscado.
 * @returns {Promise<Object|null>} Objeto com os dados do usuário ou null se não encontrado.
 */
async function fetchUserDataById(userId) {
    const user = await getUserDataById(userId);
    if (!user) {
        return null;
    }
    return user;
}

/**
 * Busca os posts de um usuário específico em ordem cronológica (mais recentes primeiro).
 * @param {string} userId - O ID do usuário.
 * @returns {Promise<Array<Object>>} Array com os posts do usuário.
 */
async function fetchUserPostsChronologically(userId) {
    // Verifica se o usuário existe antes de buscar os posts
    const userExists = await getUserDataById(userId); 
    if (!userExists) {
        throw new Error('Usuário não encontrado'); // Lança um erro que pode ser capturado no controller
    }
    return await getPostsByUserIdOrdered(userId);
}

/**
 * Cria um novo post para um usuário.
 * @param {string} userId - ID do usuário que está criando o post.
 * @param {string} description - Descrição do post.
 * @param {string} imageUrl - URL da imagem do post.
 * @param {Array<string>} sportsArray - Array de esportes relacionados ao post.
 * @returns {Promise<Object>} O post criado.
 */
async function createNewPost(userId, description, imageUrl, sportsArray) {
    if (!description || !sportsArray || !Array.isArray(sportsArray)) {
        throw new Error('Dados inválidos para criar o post.');
    }
    return await createPostInFirestore(userId, description, imageUrl, sportsArray);
}

module.exports = {
    compararEsportesEntreUsers,
    fetchUserDataById,
    fetchUserPostsChronologically,
    createNewPost
};
