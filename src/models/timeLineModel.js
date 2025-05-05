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

module.exports = { obterDadosPost };