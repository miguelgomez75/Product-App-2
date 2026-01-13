const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Cambiado de "title" a "name" para consistencia con GraphQL
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 }, // ⬅️ AGREGADO
  imageUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);