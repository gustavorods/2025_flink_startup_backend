const db = require("../config/firebaseConfig");

/**
 * Função para buscar os dados de uma postagem (imagem, descrição e tags).
 * @param {string} postId - O ID da postagem.
 * @returns {Object} - Dados da postagem (imagem, descrição, tags).
 */
async function obterDadosPost(postId) {
  const postRef = db.collection("posts").doc(postId);
  const doc = await postRef.get();

  if (!doc.exists) {
    throw new Error("Postagem não encontrada.");
  }

  const postData = doc.data();
  return {
    imagem: postData.image,
    descricao: postData.description,
    tags: postData.sports || [],
    fotoPerfil: postData.fotoPerfil,
    nome: postData.nome,
  };
}

async function getPostsByUserIds(userIds, limit = 10) {
  // console.log("userIds", userIds);

  const allResults = [];

  const batches = [];
  for (let i = 0; i < userIds.length; i += 10) {
    batches.push(userIds.slice(i, i + 10));
    // console.log("batches", batches);
  }

  for (const group of batches) {
    const querySnapshot = await db
      .collection("posts")
      .where("userId", "in", group)
      .orderBy("created_at", "desc")
      .limit(limit)
      .get();
    console.log(`Query snapshot for userIds ${group}:`, querySnapshot.docs.length);


    querySnapshot.forEach(doc => {
      allResults.push({ id: doc.id, ...doc.data() });
    });
  }

  // Ordenar todos os posts por data (decrescente)
  return allResults
    .sort((a, b) => b.created_at.toMillis() - a.created_at.toMillis())
    .slice(0, limit);
}


module.exports = { obterDadosPost, getPostsByUserIds };