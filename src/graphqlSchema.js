const { buildSchema } = require('graphql');

const schema = buildSchema(`
type Message {
  id: ID!
  content: String
  author: String
}

input MessageInput {
  content: String
  author: String
}

type User {
  email: String
  role: Int
  pass: String
}

input UserInput {
  email: String
  pass: String
  role: Int
}

type Mutation {
  createMessage(input: MessageInput): Message
  updateMessage(id: ID!, input: MessageInput): Message
}

type Query {
  getMessage(id: ID!): Message
  rollDice(numDice: Int!, numSides: Int): [Int]
  getUser(email: String): User   
}
`);

module.exports = { schema };
