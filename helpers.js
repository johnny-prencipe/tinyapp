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

const generateRandomString = () => {
  returnStr = ''
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  for (let i = 0; i < 6; i++) {
    returnStr += chars[Math.floor(Math.random() * chars.length)]
  };
  return returnStr;
}

module.exports = { 
  getUserByEmail,
  urlsForUser,
  generateRandomString
};