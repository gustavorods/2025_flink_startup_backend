// Importa o model que acessa o banco
const { listUsersFromFirestore, getSeguidos } = require("../models/userModel");

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
        console.log("jaSegue", jaSegue);

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

module.exports = {
    compararEsportesEntreUsers
};
