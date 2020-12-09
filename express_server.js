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
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

// post logic for when a form is submitted
app.post('/urls', (req, res) => {
  console.log(req.body); //log the POST request to the console
  res.send('ok'); //respond with 'ok'
});

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

// message on app bootup
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));