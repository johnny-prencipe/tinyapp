const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
};

const urlsForUser = (name, database) => {
  const returnObj = {};
  for (let i in database) {
    if (database[i].username === name) {
      returnObj[i] = database[i];
    }
  }
  return returnObj;
};

const generateRandomString = () => {
  let returnStr = '';
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  for (let i = 0; i < 6; i++) {
    returnStr += chars[Math.floor(Math.random() * chars.length)];
  }
  return returnStr;
};

const validUserCheck = (req, res, database) => {
  const username = req.session.user_id;
  if (!urlsForUser(username, database)[req.params.url]) {
    res.redirect('/');
    return false;
  }
}


const isLoggedIn = (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return false;
  }
}

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
  validUserCheck,
  isLoggedIn
};