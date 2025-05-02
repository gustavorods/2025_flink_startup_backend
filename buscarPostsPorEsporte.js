const db = require('./config/firebaseConfig.js');

/**
 * Busca posts de usuários que praticam os mesmos esportes que um usuário específico.
 *
 * @param {string} initialUserId O ID do usuário inicial para basear a busca de esportes.
 * @returns {Promise<Array<object>>} Uma Promise que resolve para um array de objetos de post,
 *                                    cada um contendo o ID do post e seus dados. Retorna
 *                                    um array vazio se nenhum post for encontrado ou em caso de erro.
 */
async function buscarPostsPorEsporte(initialUserId) {
  console.log(`Iniciando busca de posts baseada nos esportes do usuário: ${initialUserId}`);

  try {
    // 1. Buscar o usuário inicial e seus esportes
    const userRef = db.collection('users').doc(initialUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`Usuário inicial com ID ${initialUserId} não encontrado na coleção 'users'.`);
      return [];
    }

    const userData = userDoc.data();
    // Modificação: Ler do campo 'interests' que é um array de objetos
    const userInterests = userData.interests;

    if (!Array.isArray(userInterests) || userInterests.length === 0) {
      console.log(`Usuário ${initialUserId} não tem interesses definidos ou o campo 'interests' não é um array válido.`);
      return [];
    }

    // Modificação: Extrair e achatar a lista de esportes do array 'interests'
    // Assumindo que interest.sport é um array de strings
    const userSports = userInterests.reduce((allSports, interest) => {
      if (Array.isArray(interest.sport)) {
        allSports.push(...interest.sport);
      }
      // Remove duplicados
      return [...new Set(allSports)];
    }, []);

    if (userSports.length === 0) {
      console.log(`Nenhum esporte encontrado nos interesses do usuário ${initialUserId}.`);
    }

    console.log(`Esportes de ${initialUserId}:`, userSports); // Corrigido de userSport para userSports

    // --- Atenção: Limitação do Firestore ---
    // A consulta 'array-contains-any' é limitada a 10 itens no array de comparação.
    // Se o usuário praticar mais de 10 esportes, considere buscar pelos 10 mais relevantes
    // ou fazer múltiplas consultas (o que pode ser menos eficiente).
    let sportsToQuery = userSports;
    if (userSports.length > 10) {
        console.warn(`Aviso: O usuário pratica ${userSports.length} esportes. A busca será limitada aos 10 primeiros devido à limitação do Firestore.`);
        sportsToQuery = userSports.slice(0, 10);
    }
    // --- Fim da Atenção ---

    // 2. Buscar outros usuários que praticam pelo menos um desses esportes
    // Modificação: Buscar na coleção 'users'.
    // ASSUMINDO que existe um campo 'sportsList' (array de strings) nos documentos de usuário para busca eficiente.
    const matchingUsersQuery = db.collection('users') // Coleção 'users'
                                 .where('sportsList', 'array-contains-any', sportsToQuery); // Campo denormalizado 'sportsList'

    const matchingUsersSnapshot = await matchingUsersQuery.get();

    const matchingUserIds = [];
    matchingUsersSnapshot.forEach(doc => {
      // Garantir que não incluímos o usuário inicial na lista de "outros" usuários
      if (doc.id !== initialUserId) {
        matchingUserIds.push(doc.id);
      }
    });

    if (matchingUserIds.length === 0) {
      console.log('Nenhum outro usuário encontrado praticando os mesmos esportes.');
      return [];
    }

    console.log(`Encontrados ${matchingUserIds.length} usuários com esportes em comum (IDs):`, matchingUserIds);

    // 3. Buscar posts desses usuários
    const allPosts = [];
    // --- Atenção: Limitação do Firestore ---
    // A consulta 'in' também é limitada a 10 itens no array de comparação.
    // Precisamos dividir a busca em blocos de 10 IDs se houver muitos usuários.
    const chunkSize = 10;
    for (let i = 0; i < matchingUserIds.length; i += chunkSize) {
        const userIdChunk = matchingUserIds.slice(i, i + chunkSize);

        if (userIdChunk.length > 0) {
            console.log(`Buscando posts para o bloco de usuários: ${userIdChunk.join(', ')}`);
            const postsQuery = db.collection('posts')
                                 .where('authorId', 'in', userIdChunk); // Corrigido para 'authorId' nos posts
            const postsSnapshot = await postsQuery.get();

            postsSnapshot.forEach(doc => {
                // Adiciona o post (com seu ID e todos os campos) ao array de resultados
                allPosts.push({ id: doc.id, ...doc.data() });
            });
        }
    }
    // --- Fim da Atenção ---

    console.log(`Busca concluída. Total de ${allPosts.length} posts encontrados.`);
    return allPosts;

  } catch (error) {
    console.error("Erro durante a busca de posts por esporte:", error);
    return []; // Retorna array vazio em caso de erro
  }
}


const userIdExemplo = 'u001'; // Substitua pelo ID
buscarPostsPorEsporte(userIdExemplo)
  .then(posts => {
    console.log("\n--- Posts Encontrados ---");
    if (posts.length > 0) {
      console.log(JSON.stringify(posts, null, 2)); // Imprime os posts formatados
    } else {
      console.log("Nenhum post correspondente encontrado.");
    }
  })
  .catch(error => {
    console.error("Erro ao executar a busca:", error);
  });


// module.exports = buscarPostsPorEsporte;