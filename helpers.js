const getUserByEmail = function(email, database) {
  let userDB = database;
  for (let user in users) {
    const currentUser = users[user];
    if (currentUser.email === email) {
      return currentUser;
    }
  }
  return false;
};


module.exports = { getUserByEmail };