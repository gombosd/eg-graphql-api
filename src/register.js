const { db } = require('./db');
const { User } = require('./schemas');

const addUser = (req, res) => {
  const { email, pass } = req.body;

  if (db.users[email]) {
    res.send('email already exists: ' + email);
    throw new Error('email already exists: ' + email);      
  }
  db.users[email] = { email: email, role: 1}
  return res.send(new User(email, pass));
}
const addAdmin = (req, res) => {
  if (!db.users[email]) {
    res.send('user does not exists with email: ' + email);      
    throw new Error('user does not exists with email: ' + email);      
  }
  db.users[email].role = 2;
  return res.send(new User(email, pass));
}