const db = require('./config/firebaseConfig.js');

async function testarFirestore() {
  try {
    const docRef = db.collection('teste_conexao').doc('documento_teste');
    await docRef.set({
      mensagem: 'Conexão com Firestore bem-sucedida!',
      timestamp: new Date(),
    });

    console.log('✅ Documento escrito com sucesso.');

    // Lendo o documento de teste
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('📄 Conteúdo do documento:', doc.data());
    } else {
      console.log('⚠️ Documento não encontrado.');
    }
  } catch (error) {
    console.error('❌ Erro ao testar o Firestore:', error);
  }
}

testarFirestore();
