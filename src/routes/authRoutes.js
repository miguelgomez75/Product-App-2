const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

router.post('/register', async (req, res) => {
  try{
    const { username, password, role } = req.body;
    if(!username || !password) return res.status(400).json({ message: 'Faltan credenciales' });

    const exists = await User.findOne({ username });
    if(exists) return res.status(400).json({ message: 'Usuario ya existe' });

    const passwordHash = await User.hashPassword(password);
    const user = new User({ username, passwordHash, role: role || 'user' });
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/login', async (req, res) => {
  try{
    const { username, password } = req.body;
    if(!username || !password) return res.status(400).json({ message: 'Faltan credenciales' });

    const user = await User.findOne({ username });
    if(!user) return res.status(400).json({ message: 'Usuario o contraseña inválidos' });

    const ok = await user.verifyPassword(password);
    if(!ok) return res.status(400).json({ message: 'Usuario o contraseña inválidos' });

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
