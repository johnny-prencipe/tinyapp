const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
}

const generateRandomString = () => {
  returnStr = ''
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  for (let i = 0; i < 6; i++) {
    returnStr += chars[Math.floor(Math.random() * chars.length) + 1]
  };
  return returnStr;
}

// post logic for when a form is submitted
app.post('/urls/', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL'];
  console.log(`new short URL: ${shortURL} for: ${urlDatabase[shortURL]}`);
  res.send(`/urls/${shortURL}`);  // show user their new URL
});
app.post('/urls/:url/delete', (req, res) => {
  delete urlDatabase[req.params.url];
  console.log(req.params, 'deleted');
  res.redirect('/urls');
})

// URL tree
app.get('/urls/new', (req, res) => res.render('urls_new'));
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});
app.get('/', (req, res) => res.send('Hello!'));
app.get('/urls.json', (req, res) => res.send(urlDatabase));
app.get('/hello', (req, res) => res.send('<html><body>Hello <b>World</b></body></html>\n'));
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});
app.get('/u/:shortURL', (req, res) => { 
  const longURL = urlDatabase[req.params['shortURL']]; 
  console.log(longURL); 
  res.redirect(longURL); 
});

// message on app bootup
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));