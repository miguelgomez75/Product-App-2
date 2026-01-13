const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
  }

  type OrderProduct {
    product: Product!
    name: String!
    price: Float!
    quantity: Int!
  }

  type Order {
    id: ID!
    user: User!
    products: [OrderProduct!]!
    total: Float!
    status: String!
    createdAt: String!
  }

  type User {
    id: ID!
    username: String!
    role: String!
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product
    orders: [Order!]!
    order(id: ID!): Order
    myOrders: [Order!]!
    ordersByStatus(status: String!): [Order!]!
  }

  input ProductInput {
    product: ID!
    quantity: Int!
  }

  type Mutation {
    createOrder(products: [ProductInput!]!): Order!
    updateOrderStatus(id: ID!, status: String!): Order!
  }
`;

module.exports = typeDefs;
