const { buscarImagemDoPost } = require("../models/timeLineModel");

async function obterImagemDoPost(req, res) {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({ error: "postId é obrigatório." });
  }

  try {
    const imagem = await buscarImagemDoPost(postId);
    return res.status(200).json({ imagem });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
}

module.exports = {
  obterImagemDoPost,
};
