const { obterDadosPost } = require("../models/timeLineModel");
const feedService = require("../services/feedService");


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
    res.status(200).json(postData);
  } catch (error) {
    console.error("Erro ao obter dados da postagem:", error.message);
    res.status(404).json({ error: error.message });
  }
}

async function getFeed(req, res) {
  const { userId } = req.params;
  // return res.status(400).json({ userId });

  if (!userId) return res.status(400).json({ error: "userId é obrigatório" });

  try {
    const feed = await feedService.gerarFeed(userId);
    res.status(200).json(feed);
  } catch (error) {
    console.error("Erro ao gerar feed:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { obterDadosDaPostagem, getFeed };