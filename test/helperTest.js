const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


// const getUserByEmail = function(email, database) {
//   let userDB = database;
//   for (let user in users) {
//     const currentUser = users[user];
//     if (currentUser.email === email) {
//       return currentUser;
//     }
//   }
//   return false;
// };






describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user.email)
  });
});