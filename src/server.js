require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Importar rutas
const authRoutes = require('./routes/authRoutes'); // ⬅️ CORREGIDO
const productRoutes = require('./routes/productRoutes'); // ⬅️ CORREGIDO
const userRoutes = require('./routes/users_routes'); // ⬅️ CORREGIDO

// Importar GraphQL
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('src/public'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// Rutas REST
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Configurar Apollo Server con contexto de autenticación
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Obtener token del header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { user: decoded };
      } catch (error) {
        console.log('Token inválido');
      }
    }
    
    return { user: null };
  }
});

// Iniciar Apollo Server
async function startApolloServer() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });
  
  console.log(`🚀 GraphQL disponible en http://localhost:3000${apolloServer.graphqlPath}`);
}

startApolloServer();

// Socket.IO - Chat
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Token requerido'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.user.username}`);
  
  socket.on('message', (data) => {
    io.emit('message', {
      username: socket.user.username,
      message: data.message,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.user.username}`);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Servidor corriendo en http://localhost:${PORT}`);
});