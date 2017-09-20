const  { db }  = require('./db');
const { User, Message } = require('./schemas');
const { getUser } = require('./auth');

const nonAuthRoot = {
  rollDice: function ({numDice, numSides}) {
    var output = [];
    for (var i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)));
    }
    return output;
  },
}

const userRoot = {
  getMessage: function ({id}) {
    if (!db.messages[id]) {
      throw new Error('no message exists with id ' + id);
    }
    return new Message(id, db.messages[id]);
  },
  getUser,
};

const adminRoot = {
  createMessage: function ({input}) {
    var id = require('crypto').randomBytes(10).toString('hex');

    db.messages[id] = input;
    return new Message(id, input);
  },
  updateMessage: function ({id, input}) {
    if (!db.messages[id]) {
      throw new Error('no message exists with id ' + id);
    }
    db.messages[id] = input;
    return new Message(id, input);
  },
}

module.exports = {
  nonAuthRoot,
  userRoot,
  adminRoot,
}