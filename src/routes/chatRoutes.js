const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/authenticateJWT');

// ejemplo: endpoint que devuelve info del usuario (para frontend)
router.get('/me', authenticateJWT, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
});

module.exports = router;
