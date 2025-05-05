const { findUserByEmail } = require('../models/userModel');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ userId: decoded.userId });
  } catch (err) {
    console.error('Erro na verificação do token:', err);
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

const verificarEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório.' });
  }

  try {
    const user = await findUserByEmail(email);
    return res.status(200).json({ existe: !!user });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return res.status(500).json({ message: 'Erro interno ao verificar email.' });
  }
};

module.exports = { verifyToken, verificarEmail };