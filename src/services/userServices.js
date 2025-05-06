// Importa o model que acessa o banco
const { listUsersFromFirestore } = require("../models/userModel");

/**
 * Compara os esportes do usuário principal com os demais usuários
 * @param {string} userId - ID do usuário principal
 * @param {Array} esportesUserPrincipal - Array com os esportes do usuário principal
 * @returns {Array} Lista de objetos dos usuários com esportes em comum
 */
async function compararEsportesEntreUsers(userId, esportesUserPrincipal) {
    // Busca todos os usuários cadastrados
    const users = await listUsersFromFirestore();

    // Lista de usuários com esportes em comum
    let usuariosSemelhantes = [];

    // Percorre todos os usuários para comparar os esportes
    for (let i = 0; i < users.length; i++) {
        const esportesUsuario = users[i].esportes;

        // Verifica se o ID do usuário não é o mesmo que o do usuário principal
        if (users[i].id === userId) {
            continue;  // Pula o próprio usuário
        }

        // Verifica se há ao menos um esporte em comum
        const temEsporteEmComum = esportesUsuario.some(esporte =>
            esportesUserPrincipal.includes(esporte)
        );

        // Se houver, adiciona o usuário completo na lista
        if (temEsporteEmComum) {
            usuariosSemelhantes.push(users[i]);
        }
    }

    return usuariosSemelhantes;
}

module.exports = {
    compararEsportesEntreUsers
};
