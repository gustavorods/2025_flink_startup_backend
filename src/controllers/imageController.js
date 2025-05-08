const { uploadImage } = require('../models/imageModel');

exports.uploadImageHandler = async (req, res) => {
  const { userId, type } = req.params;
  const file = req.file;

  if (type !== 'profile' && type !== 'post') {
    return res.status(400).send('Tipo de upload inválido. Deve ser "profile" ou "post".');
  }

  if (!file) {
    return res.status(400).send('Nenhum arquivo foi enviado.');
  }

  let postId = null;
  let postDetails = {};

  if (type === 'post') {
    const { postId: bodyPostId, personName, userProfileImageUrl, postDescription, postTags } = req.body;

    if (!bodyPostId) {
      return res.status(400).send('O campo "postId" é obrigatório no corpo da requisição para uploads do tipo "post".');
    }

    postId = bodyPostId;
    postDetails = {
      personName,
      userProfileImageUrl,
      postDescription,
      postTags: Array.isArray(postTags)
        ? postTags
        : postTags
        ? [postTags]
        : undefined,
    };
  }

  try {
    const imageUrl = await uploadImage(userId, postId, file, type, postDetails);
    res.json({ message: 'Upload realizado com sucesso!', imageUrl });
  } catch (error) {
    console.error('Erro no controller ao fazer upload da imagem:', error);
    res.status(500).send(error.message || 'Erro ao fazer upload da imagem');
  }
};
