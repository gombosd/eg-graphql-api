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

module.exports = {
  Message,
  User,
}