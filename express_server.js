const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.set('view engine', 'ejs')


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
}

const users = { 
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
}

const getUserByEmail = email => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
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
  delete urlDatabase[req.params.url];
  console.log(req.params, 'deleted');
  res.redirect('/urls');
})

// updating a URL, after checking to see if it exists
app.post('/urls/:url/update', (req, res) => {
  if (!urlDatabase[req.params.url]) {
    res.redirect('/urls')
    console.log('Error: no such URL:', req.params.url);
    return;
  }
  urlDatabase[req.params.url] = req.body.longURL;
});

// making edit buttons to redirect to the edit page
app.post('/urls/:url', (req, res) => {
  res.redirect(`/urls/${req.params.url}`);
});

// making a new shortURL
app.post('/urls/', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL'];
  console.log(`new short URL: ${shortURL} for: ${urlDatabase[shortURL]}`);
  res.send(`/urls/${shortURL}`);  // show user their new URL
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
  console.log(users)
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
  console.log(users)
  res.cookie('username', id);
  res.redirect('/');
});

// URL tree
app.get('/urls/new', (req, res) => {
  const templateVars = {

    username: req.cookies['username']
  }
  res.render('urls_new', templateVars)
});
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});
app.get('/register', (req, res) => {
  const id = req.cookies['id']
  const username = users[id];
  const templateVars = { username };
  res.render('create_account.ejs', templateVars);
});
app.get('/login', (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { username }
  res.render('login.ejs', templateVars)
});
app.get('/', (req, res) => res.redirect('/urls'));
app.get('/urls.json', (req, res) => res.send(urlDatabase));
app.get('/hello', (req, res) => res.send('<html><body>Hello <b>World</b></body></html>\n'));
app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  }
  res.render('urls_index', templateVars);
});
app.get('/u/:shortURL', (req, res) => { 
  const longURL = urlDatabase[req.params['shortURL']]; 
  console.log(longURL); 
  res.redirect(longURL); 
});

// message on app bootup
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));