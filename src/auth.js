const jwt = require('jsonwebtoken');

const { db } = require('./db');
const { User } = require('./schemas');

const secret = 'fuckinHighClassSecret*'

const getUser = ({ email }) => {
    var user = db.users[email];
    if (!user) {
      throw new Error('no user exists with email ' + email);
    }
    return new User(email, user.pass, user.role);
}

const auth = function(req, res) {
  console.log(req.body)
  const user = getUser(req.body);

  if (user.pass !== req.body.pass) {
    throw new Error('wrong pass');      
  }

  payload = {
    role: user.role,
  }
  const token = jwt.sign(payload, secret, { expiresIn: '30d' });
  res.send(token)
}

const verify = function(req, res, next, reqCert) {
  if (!req.headers.authorization) return res.status(403).json({ message: 'Nem érkezett token!' });
  return jwt.verify(req.headers.authorization.slice(7), secret, (err, info) => {
    if (err && err.name === 'JsonWebTokenError') return res.status(403).json({ message: 'Invalid token' });
    else if (info.role >= reqCert) return next();
    return res.status(403).json({ message: 'Ehhez a feladathoz felhasználói jogosultság szükséges!' });
  });
}

module.exports = {
    auth,
    verify,
}