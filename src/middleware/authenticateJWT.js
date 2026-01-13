const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function authenticateJWT(req, res, next){
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if(!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, username, role, iat, exp }
    next();
  } catch(err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function authorizeRoles(...allowedRoles){
  return (req, res, next) => {
    if(!req.user) return res.status(401).json({ message: 'No user' });
    if(!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { authenticateJWT, authorizeRoles };
