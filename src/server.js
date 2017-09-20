var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Query {
    getMessage(id: ID!): Message
    rollDice(numDice: Int!, numSides: Int): [Int]
    getUser(email: String): User   
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
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
`);

// If Message had any complex fields, we'd put them on this object.
class Message {
  constructor(id, {content, author}) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

class User {
  constructor(email, pass, role) {
    this.email = email;
    this.pass = pass;
    this.role = role;
  }
}

var app = express();
app.use(bodyParser.json());
var secret = 'fuckinHighClassSecret*'

var auth = function(req, res) {
  console.log(req.body)
  const user = adminRoot.getUser(req.body);

  if (user.pass !== req.body.pass) {
    throw new Error('wrong pass');      
  }

  payload = {
    role: user.role,
  }
  var token = jwt.sign(payload, secret, { expiresIn: '30d' });
  res.send(token)
}

var verify = function(req, res, next, reqCert) {
  if (!req.headers.authorization) return res.status(403).json({ message: 'Nem érkezett token!' });
  return jwt.verify(req.headers.authorization.slice(7), secret, (err, info) => {
    if (err && err.name === 'JsonWebTokenError') return res.status(403).json({ message: 'Invalid token' });
    else if (info.role >= reqCert) return next();
    return res.status(403).json({ message: 'Ehhez a feladathoz felhasználói jogosultság szükséges!' });
  });
}

// Maps username to content
var fakeDatabase = {};
var fakeUserDB = {
  hurka: {
    pass: 'kecske',
    role: 5,
  }
};

var userRoot = {
  getMessage: function ({id}) {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id);
    }
    return new Message(id, fakeDatabase[id]);
  },
  createMessage: function ({input}) {
    // Create a random id for our "database".
    var id = require('crypto').randomBytes(10).toString('hex');

    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  updateMessage: function ({id, input}) {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id);
    }
    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  
  // nyilvánvalóan szar reg
  addUser: function ({ email, pass }) {
    if (fakeUserDB[email]) {
      throw new Error('email already exists: ' + email);      
    }
    fakeUserDB[email] = { pass, role: 1}
    return new User(email, pass);
  },
  addAdmin: function ({ email, pass }) {
    if (fakeUserDB[email]) {
      throw new Error('email already exists: ' + email);      
    }
    fakeUserDB[email] = { pass, role: 2}
    return new User(email, pass);
  },
};

var adminRoot = {
  rollDice: function ({numDice, numSides}) {
    var output = [];
    for (var i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)));
    }
    return output;
  },
  getUser: function ({ email }) {
    var user = fakeUserDB[email];
    if (!user) {
      throw new Error('no user exists with email ' + email);
    }
    return new User(email, user.pass, user.role);
  },
}


app.post('/login', auth);

app.use((req, res, next) => {
  verify(req,res,next,1);
});
app.use('/graphqlUser', graphqlHTTP({
  schema,
  rootValue: userRoot,
  graphiql: true,
}));

app.use((req, res, next) => {
  verify(req,res,next,2);
});
app.use('/graphqlAdmin', graphqlHTTP({
  schema,
  rootValue: adminRoot,
  graphiql: true,
}));
app.listen(4000, () => {
  console.log('Running a GraphQL API server at localhost:4000/graphql');
});