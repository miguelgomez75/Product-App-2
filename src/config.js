require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/portalproductos',
  JWT_SECRET: process.env.JWT_SECRET || 'tu_secreto_jwt_aqui',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '2h'
};
