const admin = require('firebase-admin');
require('dotenv').config(); // Carregando variáveis de ambiente

// Parse JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;