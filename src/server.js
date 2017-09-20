const express = require('express');
const graphqlHTTP = require('express-graphql');
const bodyParser = require('body-parser');

const { schema } = require('./graphqlSchema');
const { roles } = require('./enums');
const { auth, verify } = require('./auth');
const { nonAuthRoot, userRoot, adminRoot } = require('./rootes');
const { addUser, makeAdmin } = require('./register');

const app = express();
app.use(bodyParser.json());

// no authentication
app.post('/login', auth);
app.post('/signup', addUser);

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: nonAuthRoot,
  graphiql: true,
}));

// USER level authentication
app.use((req, res, next) => {
  verify(req,res,next,roles.USER);
});
app.use('/graphqlUser', graphqlHTTP({
  schema,
  rootValue: userRoot,
  graphiql: true,
}));

// ADMIN level authentication
app.use((req, res, next) => {
  verify(req,res,next,roles.ADMIN);
});
app.post('/makeAdmin', makeAdmin)
app.use('/graphqlAdmin', graphqlHTTP({
  schema,
  rootValue: adminRoot,
  graphiql: true,
}));

app.listen(4000, () => {
  console.log('Running a GraphQL API server at localhost:4000/graphql');
});
