const AWS = require('aws-sdk');
const path = require('path');
const admin = require('firebase-admin');

// Inicializar o Firebase
const db = require("../config/firebaseConfig");

// Instanciação do S3
const s3 = new AWS.S3();

async function uploadImage(userId, postId, file, type, postDetails = {}) {
  // userId: ID of the user.
  // postId: ID of the post (used if type is 'post'). Can be null/undefined if type is 'profile'.
  // file: The image file object (from multer).
  // type: 'profile' or 'post'.
  // postDetails: Object containing additional data for a post.
  //   { personName, userProfileImageUrl, postDescription, postTags }

  const fileContent = file.buffer; // Usando o multer, o conteúdo do arquivo é acessado via buffer
  // const fileName = file.originalname; // Nome do arquivo original, se necessário

  // Define o tipo de imagem (perfil ou post)
  let s3Key = '';
  if (type === 'profile') {
    s3Key = `users/${userId}/profile.jpg`;  // Para a imagem de perfil
  } else if (type === 'post') {
    if (!postId) { // postId é um parâmetro direto
      console.error('Error: postId parameter is required for type "post".', { userId, type, postId });
      throw new Error('O parâmetro postId é obrigatório para fazer upload de uma imagem de post.');
    }
    s3Key = `users/${userId}/posts/${postId}/image.jpg`; // Para a imagem do post
  } else {
    console.error('Error: Invalid image type specified.', { type });
    throw new Error('Tipo de imagem inválido. Deve ser "profile" ou "post".');
  }

  const s3Params = {
    Bucket: 'flink-images',
    Key: s3Key,  // Caminho no bucket
    Body: fileContent,
    ContentType: file.mimetype || 'image/jpeg', // Tipo de conteúdo, usa o mimetype do arquivo ou fallback
  };

  try {
    // Fazendo o upload para o S3
    const s3UploadResult = await s3.upload(s3Params).promise();
    console.log('Upload para S3 bem-sucedido. URL:', s3UploadResult.Location);

    // Obtém o URL da imagem
    const imageUrl = s3UploadResult.Location; // URL pública do objeto no S3

    // Salva o URL no Firestore
    if (type === 'profile') {
      const userDocRef = db.collection('users').doc(userId);
      await userDocRef.update({ profileImageUrl: imageUrl });
      console.log('URL da imagem de perfil armazenada no Firestore para o usuário:', userId);
    } else if (type === 'post') {
      // postId é o parâmetro da função, já validado para a chave S3.
      const { personName, userProfileImageUrl, postDescription, postTags } = postDetails;

      const postDocRef = db.collection('posts').doc(postId); // Usa o postId fornecido

      const firestorePostData = {
        image: imageUrl, // URL da imagem do post que foi feito upload
        userId: userId,  // ID do usuário que criou o post
        created_at: admin.firestore.FieldValue.serverTimestamp(), // Data da postagem

        // Adiciona outros detalhes do post se fornecidos em postDetails
        ...(personName !== undefined && { nome: personName }), // nome pessoa
        ...(userProfileImageUrl !== undefined && { fotoPerfil: userProfileImageUrl }), // imagem pessoa (URL do perfil)
        ...(postDescription !== undefined && { description: postDescription }), // descrição post
        ...(postTags !== undefined && { sports: postTags }), // tags do post (array)
      };
      
      // Opcional: Loga um aviso se alguns detalhes esperados estiverem faltando
      if (personName === undefined || userProfileImageUrl === undefined || postDescription === undefined || postTags === undefined) {
        console.warn(`Aviso: Nem todos os detalhes adicionais do post (personName, userProfileImageUrl, postDescription, postTags) foram fornecidos para o post ${postId}. Prosseguindo com os dados disponíveis.`);
      }

      // Usa set com merge:true para criar o documento se não existir,
      // ou atualizar/adicionar campos se existir.
      await postDocRef.set(firestorePostData, { merge: true });
      console.log(`Dados do post (incluindo URL da imagem) armazenados/atualizados no Firestore para o post: ${postId}`);
    }

    return imageUrl; // Retorna o URL público da imagem
  } catch (err) {
    console.error('Erro durante o upload para S3 ou operação no Firestore:', err, { userId, type, postId, s3Key });
    throw err; // Re-lança o erro para ser tratado pelo chamador
  }
}

module.exports = { uploadImage };
