const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateJWT, authorizeRoles } = require('../middleware/authenticateJWT');

// Obtener listado (público)
router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// Obtener detalle
router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id);
  if(!p) return res.status(404).json({ message: 'No encontrado' });
  res.json(p);
});

// Crear (admin)
router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { name, description, price, stock, imageUrl } = req.body; // Cambiado "title" por "name"
  const product = new Product({ 
    name,  // Cambiado
    description, 
    price, 
    stock: stock || 0, // Agregado
    imageUrl, 
    createdBy: req.user.id 
  });
  await product.save();
  res.status(201).json(product);
});

// Editar (admin)
router.put('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const updates = req.body;
  const p = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
  if(!p) return res.status(404).json({ message: 'No encontrado' });
  res.json(p);
});

// Borrar (admin)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Eliminado' });
});

module.exports = router;