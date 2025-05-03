const admin = require('firebase-admin');
require('dotenv').config(); // Carregando variáveis de ambiente

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.project_id,
    clientEmail: process.env.client_email,
    privateKey: process.env.private_key.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

module.exports = db;