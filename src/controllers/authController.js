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

module.exports = { verifyToken };