const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const resolvers = {
  Query: {
    // Obtener todos los productos
    products: async () => {
      return await Product.find();
    },

    // Obtener un producto por ID
    product: async (_, { id }) => {
      return await Product.findById(id);
    },

    // Obtener todos los pedidos (solo admin)
    orders: async (_, __, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('No autorizado');
      }
      return await Order.find()
        .populate('user')
        .populate('products.product');
    },

    // Obtener un pedido por ID
    order: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error('No autenticado');
      }
      
      const order = await Order.findById(id)
        .populate('user')
        .populate('products.product');
      
      // Solo el dueño o admin puede ver el pedido
      if (context.user.role !== 'admin' && order.user._id.toString() !== context.user.id) {
        throw new Error('No autorizado');
      }
      
      return order;
    },

    // Obtener pedidos del usuario actual
    myOrders: async (_, __, context) => {
      if (!context.user) {
        throw new Error('No autenticado');
      }
      
      return await Order.find({ user: context.user.id })
        .populate('user')
        .populate('products.product');
    },

    // Filtrar pedidos por estado
    ordersByStatus: async (_, { status }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('No autorizado');
      }
      
      return await Order.find({ status })
        .populate('user')
        .populate('products.product');
    }
  },

  Mutation: {
    // Crear un nuevo pedido (comprar carrito)
    createOrder: async (_, { products }, context) => {
      if (!context.user) {
        throw new Error('No autenticado');
      }

      // Obtener información de productos y calcular total
      let total = 0;
      const orderProducts = [];

      for (const item of products) {
        const product = await Product.findById(item.product);
        
        if (!product) {
          throw new Error(`Producto ${item.product} no encontrado`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }

        // Reducir stock
        product.stock -= item.quantity;
        await product.save();

        const subtotal = product.price * item.quantity;
        total += subtotal;

        orderProducts.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity
        });
      }

      // Crear el pedido
      const order = new Order({
        user: context.user.id,
        products: orderProducts,
        total,
        status: 'pending'
      });

      await order.save();

      return await Order.findById(order._id)
        .populate('user')
        .populate('products.product');
    },

    // Actualizar estado de pedido (solo admin)
    updateOrderStatus: async (_, { id, status }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('No autorizado');
      }

      if (!['pending', 'completed'].includes(status)) {
        throw new Error('Estado inválido');
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      )
        .populate('user')
        .populate('products.product');

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      return order;
    }
  },

  // Resolvers para tipos personalizados
  Order: {
    id: (parent) => parent._id.toString(),
    user: async (parent) => {
      if (parent.user && parent.user._id) {
        return parent.user;
      }
      return await User.findById(parent.user);
    }
  },

  Product: {
    id: (parent) => parent._id.toString()
  },

  User: {
    id: (parent) => parent._id.toString()
  },

  OrderProduct: {
    product: async (parent) => {
      if (parent.product && parent.product._id) {
        return parent.product;
      }
      return await Product.findById(parent.product);
    }
  }
};

module.exports = resolvers;
