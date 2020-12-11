const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
}

const urlsForUser = (name, database) => {
  const returnObj = {};
  for (let i in database) {
    if (database[i].username === name) {
      returnObj[i] = database[i];
    }
  }
  return returnObj;
}

module.exports = { 
  getUserByEmail,
  urlsForUser
};