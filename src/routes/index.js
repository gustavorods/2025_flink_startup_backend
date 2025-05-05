// Importando os controladores
const userRoutes = require('./userRoutes.js');
const authRoutes = require('./authRoutes.js'); 
const timeLineRoutes = require('./timeLineRoutes.js'); 

// Exportando as rotas
module.exports = {
  userRoutes,
  authRoutes,
  timeLineRoutes,
};
