const db = require("../config/firebaseConfig");

async function buscarImagemDoPost(postId) {
  const postRef = db.collection("posts").doc(postId);
  const doc = await postRef.get();

  if (!doc.exists) {
    throw new Error("Postagem não encontrada.");
  }

  const postData = doc.data();

  if (!postData.image) {
    throw new Error("Imagem não disponível para este post.");
  }

  return postData.image;
}

module.exports = {
  buscarImagemDoPost,
};
