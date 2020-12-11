const { assert } = require('chai');

const { 
  getUserByEmail,
  urlsForUser
} = require('../helpers.js');

/*#######################################
###### Tests for getUserByEmail()  ######
#######################################*/

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


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
});

describe('getUserByEmail', function() {
  it('should return undefined with invalid ID', function() {
    const user = getUserByEmail("invalidID", testUsers)
    const expectedOutput = undefined;
    assert.equal(user.id, expectedOutput);
  });
});

describe('getUserByEmail', function() {
  it('should return undefined with blank ID', function() {
    const user = getUserByEmail("", testUsers)
    const expectedOutput = undefined;
    assert.equal(user.id, expectedOutput);
  });
});
/*####################################
###### Tests for urlsForUser()  ######
######################################*/

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', username: 'userRandomID'},
  '9sm5xK': { longURL: 'http://www.google.com', username: 'user2RandomID' }
}


describe('urlsForUser', function() {
  it('should return a valid object for a valid ID', function() {
    const user = urlsForUser("userRandomID", urlDatabase)
    console.log(user);
    const expectedOutput = {'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', username: 'userRandomID'}};
    assert.deepEqual(user, expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return an empty object with invalid ID', function() {
    const user = urlsForUser("invalidID", urlDatabase)
    const expectedOutput = {};
    assert.deepEqual(user, expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return an empty object with blank ID', function() {
    const user = urlsForUser("", urlDatabase)
    const expectedOutput = {};
    assert.deepEqual(user, expectedOutput);
  });
});

