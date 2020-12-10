const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.set('view engine', 'ejs')


const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', username: 'userRandomID'},
  '9sm5xK': { longURL: 'http://www.google.com', username: 'user2RandomID' }
}

const users = { 
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

const getUserByEmail = email => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
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
  const username = req.cookies['username'];
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
  const username = req.cookies['username'];
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
  if (!urlsForUser(req.cookies['username'])[req.params.shortURL]) {
    res.redirect('/');
    return false;
  }
  res.redirect(`/urls/${req.params.url}`);
});

// making a new shortURL
app.post('/urls/', (req, res) => {
  if (!req.cookies['username']) {
    res.redirect('/');
    return false;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {}
  urlDatabase[shortURL].longURL = req.body['longURL']
  urlDatabase[shortURL].username = req.cookies['username'];
  console.log(`new short URL: ${shortURL} for: ${urlDatabase[shortURL].longURL}`);
  res.redirect(`/urls/${shortURL}`);  // show user their new URL
});

// adding a cookie on login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const pw = req.body.password;
  const id = getUserByEmail(email);
  console.log(id);

  if (id.email !== email || id.password !== pw) {
    return res.status(403)
    .send('bad parameters')
  }
  res.cookie('username', id.id);
  res.redirect('/urls');
});

// adding logout functionality 
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// adding account creation functionality
app.post('/register', (req, res) => {
  const id = generateRandomString();

  if (!req.body.email || !req.body.password) {
    return res.status(400)
    .send('email or password field blank');
  }
  if (getUserByEmail(req.body.email)) {
    return res.status(400)
    .send('email already exists');
  }

  const newUser = {
    id,
    email: req.body.email,
    password: req.body.password
  };
  users[id] = newUser;
  console.log(users[id]);
  res.cookie('username', id);
  res.redirect('/');
});

// URL tree
app.get('/urls/new', (req, res) => {
  if (!req.cookies['username']) {
    res.redirect('/login');
    return false;
  }
  const templateVars = {
    username: req.cookies['username']
  }
  res.render('urls_new', templateVars)
});
app.get('/urls/:shortURL', (req, res) => {
  if (req.cookies['username'] !== urlDatabase[req.params.shortURL].username) {
    res.redirect('/');
    return false;
  }
  const templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});
app.get('/register', (req, res) => {
  if (req.cookies['username']) {
    res.redirect('/');
  }
  const id = req.cookies['username']
  const username = users[id];
  const templateVars = { username };
  res.render('create_account.ejs', templateVars);
});
app.get('/login', (req, res) => {
  const username = req.cookies['username'];
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
  if (!req.cookies['username']) {
    res.redirect('/login');
    return false;
  }
  const templateVars = {
    username: req.cookies['username'],
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