# Práctica 2 - E-commerce con GraphQL

## Instalación
1. npm install
2. Configurar .env con MONGODB_URI y JWT_SECRET
3. npm start

## Endpoints GraphQL

### Queries
- `products`: Obtener todos los productos
- `myOrders`: Pedidos del usuario actual
- `orders`: Todos los pedidos (solo admin)
- `ordersByStatus(status: String!)`: Filtrar por estado

### Mutations
- `createOrder(products: [ProductInput!]!)`: Crear pedido
- `updateOrderStatus(id: ID!, status: String!)`: Actualizar estado (admin)

## Endpoints REST
- POST /api/auth/register
- POST /api/auth/login
- GET/POST/PUT/DELETE /api/products (name, description, price, stock, imageUrl)
- GET /api/users (admin)
- PUT /api/users/:id/role (admin)
- DELETE /api/users/:id (admin)

## Funcionalidades
 - Carrito de compras con localStorage
 - Crear pedidos con GraphQL
 - Panel admin para gestionar usuarios y pedidos
 - Filtrado de pedidos por estado
 - Autenticación JWT
 - Chat en tiempo real con Socket.IO