const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
const PORT = 8080;
const urlDatabase = {};
const users = {};
const {
  getUserByEmail,
  generateRandomString,
  validUserCheck,
  isLoggedIn
} = require('./helpers');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: 'verysecure'
}));
app.set('view engine', 'ejs');


/*###########################
###### App POST Logic  ######
###########################*/

// Deletes a URL
app.post('/urls/:url/delete', (req, res) => {
  validUserCheck(req, res, urlDatabase);
  delete urlDatabase[req.params.url];
  res.redirect('/urls');
});


// Updates a URL
app.post('/urls/:url/update', (req, res) => {
  validUserCheck(req, res, urlDatabase);

  if (!urlDatabase[req.params.url]) {
    res.redirect('/urls');
    return false;
  }

  urlDatabase[req.params.url].longURL = req.body.longURL;
  res.redirect('/');
});


// Editing a URL
app.post('/urls/:url', (req, res) => {
  validUserCheck(req, res, urlDatabase);
  res.redirect(`/urls/${req.params.url}`);
});

// Posting a new ShortURL
app.post('/urls/', (req, res) => {
  isLoggedIn(req, res);

  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body['longURL'];
  urlDatabase[shortURL].user_id = req.session.user_id;

  res.redirect(`/urls/${shortURL}`);  // show user their new URL
});


// Creating a new cookie
app.post('/login', (req, res) => {

  const email = req.body.email;
  const plaintextPw = req.body.password;
  const id = getUserByEmail(email, users);

  if (id.email !== email || !bcrypt.compare(plaintextPw, id.password)) {
    return res.status(403)
      .send('bad parameters');
  }

  req.session.user_id = id.id;
  res.redirect('/urls');
});


// Logs user out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


// Registers a new account
app.post('/register', (req, res) => {

  const id = generateRandomString();
  if (!req.body.email || !req.body.password) {
    return res.status(400)
      .send('email or password field blank');
  }

  if (getUserByEmail(req.body.email, users)) {
    return res.status(400)
      .send('email already exists');
  }

  const plaintextPw = req.body.password;

  const hashedPw = bcrypt.hashSync(plaintextPw, saltRounds, function(err, hash) {

    if (err) {
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
  req.session.user_id = id;
  res.redirect('/');
});


/*##########################
###### App GET Logic  ######
##########################*/

/** Check if a user is logged in,
 * and redirecting them to the login or register
 * screen if they are not. Otherwise, display the
 * requested page.
 * Leaving this mostly uncommented as each 
 * app.get() is largely self-explanatory.
 **/


app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id
  const user = users[userId];

  isLoggedIn(req, res)
  
  const templateVars = {
    user
  };

  res.render('urls_new', templateVars);
});


app.get('/urls/:shortURL', (req, res) => {
  const userId = req.session.user_id
  const user = users[userId];
  const shortURL = req.params.shortURL;
  if (!user) {
    res.status(403)
    .send('Error: Not logged in');
    return;
  }

  if (!urlDatabase[shortURL]) {
    res.status(404)
    .send('Error: URL not found');
    return;
  }

  if (userId !== urlDatabase[shortURL].user_id) {
    res.status(403)
    .send('Error: Users can only edit their own URLs')
    return;
  }

  const templateVars = {
    user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  res.render('urls_show', templateVars);
});


app.get('/register', (req, res) => {
  const userId = req.session.user_id
  const user = users[userId];

  if (req.session.user_id) {
    res.redirect('/');
  }

  const templateVars = { user };

  res.render('create_account.ejs', templateVars);
});


app.get('/login', (req, res) => {
  const userId = req.session.user_id
  const user = users[userId];

  const templateVars = { user };

  if (user) {
    res.redirect('/');
    return false;
  }

  res.render('login.ejs', templateVars);
});


app.get('/urls', (req, res) => {
  const userId = req.session.user_id
  const user = users[userId];
  isLoggedIn(req, res);
  
  const templateVars = {
    user,
    urls: urlDatabase
  };
  
  res.render('urls_index', templateVars);
});


app.get('/u/:shortURL', (req, res) => {
  
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
  
  return res.status(403)
    .send('unknown URL');
});

app.get('/', (req, res) => res.redirect('/urls'));

// message on app bootup
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));