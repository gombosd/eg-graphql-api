const { db } = require('./db');
const { User } = require('./schemas');
const { roles } = require('./enums');

const addUser = (req, res) => {
  const { email, pass } = req.body;

  if (db.users[email]) {
    res.send('email already exists: ' + email);
    throw new Error('email already exists: ' + email);      
  }
  db.users[email] = { pass, role: roles.USER}

  return res.send(new User(email, pass));
}
const makeAdmin = (req, res) => {
  const { email, pass } = req.body;
  
  if (!db.users[email]) {
    res.send('user does not exists with email: ' + email);      
    throw new Error('user does not exists with email: ' + email);      
  }
  db.users[email].role = roles.ADMIN;
  return res.send(new User(email, pass));
}

module.exports = {
  addUser,
  makeAdmin,
}
