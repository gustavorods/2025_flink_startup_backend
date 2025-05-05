const { obterDadosPost } = require("../models/timeLineModel");

/**
 * Controlador para obter os dados de uma postagem, incluindo imagem, descrição e tags.
 * @param {Object} req - A requisição do cliente.
 * @param {Object} res - A resposta a ser enviada ao cliente.
 */
async function obterDadosDaPostagem(req, res) {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({ error: "O ID da postagem é obrigatório." });
  }

  try {
    const postData = await obterDadosPost(postId);
    res.status(200).json(postData); // Retorna os dados da postagem
  } catch (error) {
    console.error("Erro ao obter dados da postagem:", error.message);
    res.status(404).json({ error: error.message });
  }
}

module.exports = { obterDadosDaPostagem };