const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: 'verysecure'
}))
app.set('view engine', 'ejs')


const urlDatabase = {
  // driver code
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', username: 'userRandomID'},
  '9sm5xK': { longURL: 'http://www.google.com', username: 'user2RandomID' }
}

const users = { 
  //driver code
  'userRandomID': {
    id: 'userRandomID', 
    email: 'user@example.com', 
    password: 'purple-monkey-dinosaur'
  },
 'user2RandomID': {
    id: 'user2RandomID', 
    email: 'user2@example.com', 
    password: 'dishwasher-funk'
  }
}

const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
}

const urlsForUser = (name) => {
  const returnObj = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i].username === name) {
      returnObj[i] = urlDatabase[i];
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

// post logic for when a form is submitted
// deleting a URL
app.post('/urls/:url/delete', (req, res) => {
  const username = req.session.user_id;
  if (!urlsForUser(username)[req.params.url]) {
    res.redirect('/');
    return false;
  }
  delete urlDatabase[req.params.url];
  console.log(req.params, 'deleted');
  res.redirect('/urls');
})

// updating a URL, after checking to see if it exists
app.post('/urls/:url/update', (req, res) => {
  const username = req.session.user_id;
  if (!urlsForUser(username)[req.params.url]) {
    res.redirect('/');
    return false;
  }
  if (!urlDatabase[req.params.url]) {
    res.redirect('/urls')
    console.log('Error: no such URL:', req.params.url);
    return false;
  }
  console.log(`Updating ${req.params.url} from ${urlDatabase[req.params.url].longURL} to ${req.body.longURL}`)
  urlDatabase[req.params.url].longURL = req.body.longURL;
  console.log('Successfully updated.')
  res.redirect('/');
});

// making edit buttons to redirect to the edit page
app.post('/urls/:url', (req, res) => {
  if (!urlsForUser(req.session.user_id)[req.params.shortURL]) {
    res.redirect('/');
    return false;
  }
  res.redirect(`/urls/${req.params.url}`);
});

// making a new shortURL
app.post('/urls/', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/');
    return false;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {}
  urlDatabase[shortURL].longURL = req.body['longURL']
  urlDatabase[shortURL].username = req.session.user_id;
  console.log(`new short URL: ${shortURL} for: ${urlDatabase[shortURL].longURL}`);
  res.redirect(`/urls/${shortURL}`);  // show user their new URL
});

// adding a cookie on login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const plaintextPw = req.body.password;
  const id = getUserByEmail(email, users);
  console.log(id);

  console.log(bcrypt.compare(plaintextPw, id.password))

  if (id.email !== email || !bcrypt.compare(plaintextPw, id.password)) {
    return res.status(403)
    .send('bad parameters')
  }
  req.session.user_id = id.id;
  res.redirect('/urls');
});

// adding logout functionality 
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// adding account creation functionality
app.post('/register', (req, res) => {

  const id = generateRandomString();
  if (!req.body.email || !req.body.password) {
    return res.status(400)
    .send('email or password field blank');
  }

  console.log(req.body.email);

  if (getUserByEmail(req.body.email, users)) {
    return res.status(400)
    .send('email already exists');
  }

  const plaintextPw = req.body.password;

  const hashedPw = bcrypt.hashSync(plaintextPw, saltRounds, function (err, hash) {
    if (err) {
      console.log('Something went wrong:', err);
      res.redirect('/register');
      return;
    }
    return hash;
  });

  const newUser = {
    id,
    email: req.body.email,
    password: hashedPw
  };
  users[id] = newUser;
  console.log(users[id]);
  req.session.user_id = id;
  res.redirect('/');
});

// URL tree
app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return false;
  }
  const templateVars = {
    username: req.session.user_id
  }
  res.render('urls_new', templateVars)
});
app.get('/urls/:shortURL', (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.shortURL].username) {
    res.redirect('/');
    return false;
  }
  const templateVars = {
    username: req.session.user_id,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});
app.get('/register', (req, res) => {
  // This if statement throws an error, not sure why.
  // seems to be working fine && redirects as intended
  if (req.session.user_id) {
    res.redirect('/');
  }
  const id = req.session.user_id
  const username = users[id];
  const templateVars = { username };
  res.render('create_account.ejs', templateVars);
});
app.get('/login', (req, res) => {
  const username = req.session.user_id;
  const templateVars = { username }
  if (username) {
    res.redirect('/');
    return false;
  }
  res.render('login.ejs', templateVars)
});
app.get('/', (req, res) => res.redirect('/urls'));
app.get('/hello', (req, res) => res.send('<html><body>Hello <b>World</b></body></html>\n'));
app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return false;
  }
  const templateVars = {
    username: req.session.user_id,
    urls: urlDatabase
  }
  res.render('urls_index', templateVars);
});
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
  return res.status(403)
    .send('unknown URL');
});

// message on app bootup
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));