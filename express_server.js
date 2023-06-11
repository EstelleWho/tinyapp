const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');

app.use(morgan('dev'));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

// path sends back urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// path using html tags
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// to keep templates and urls 
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  console.log(urlDatabase);
  console.log('shortURL', shortURL);
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// new Url page/ add GET route to render template/show form to user
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// second route and template
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

// delete button
app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls", (req, res) => {
  // console.log('this is req.body', req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);  // show the long and short urls
});

// generate random short URL ID
function generateRandomString() {
  const length = 6;
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (var i = 0; i < length; i++) {
    const randomURL = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomURL);
  }
  return result;
}
