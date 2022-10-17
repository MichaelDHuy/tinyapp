const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "12345"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "6789"
  }
};

describe("getUserByEmail", function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefine', function() {
    const user1 = getUserByEmail("facebookisnut@facebook.com", testUsers);
    const expectedUser1ID = undefined;
    assert.strictEqual(user1, expectedUser1ID);
  });
  it('should return a user with a valid email', function() {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedPassword = "6789";
    assert.strictEqual(user.password, expectedPassword);
  })
});
