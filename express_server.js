const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const getUserByEmail = require('./helpers');
const { get } = require("request");

app.use(morgan('dev'));
app.set("view engine", "ejs");
//app.use(cookieParser()); // not anymore
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['e1d50c4f-538a-4682-89f4-c002f10a59c8', '2d310699-67d3-4b26-a3a4-1dbf2b67be5c'],
  })
);
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};
const users = { 
  "userRandomID": {
    id: "RandomUser1", 
    email: "random1@meow.com", 
    password: "meow-meow-purr"
  },
 "user2RandomID": {
    id: "RandomUser2", 
    email: "random2@woof.com", 
    password: "ouaf-ouaf"
  }
};

const addUser = (email, password) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  return id;
};

// const checkRegistration = (email, password) => {
//   if (email && password) {
//     return true;
//   }
//   return false
// };



const checkPassword= (user, password) => {
  if (user.password === password) {
    return true;
  } else {
    return false;
  }
};

// const getUserByEmail = email => {
//   return Object.values(users).find(user => user.email === email);
// }

app.get("/", (req, res) => {
  res.send("Hello!");
});

// path sends back urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// path using html tags
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// to keep templates and urls 
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],
    urls: urlsForUser(req.session["user_id"])
  };
  res.render("urls_index", templateVars);
});

// new Url page/ add GET route to render template/show form to user
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }
});

app.post("/urls", (req, res) => {
  // console.log('this is req.body', req.body); // Log the POST request body to the console
  const user = currentUser(req.session.userId, urlDatabase);
  if (!user) {
    res.redirect('/login');
  } else {
  const shortURL = generateRandomString();
  const userID = req.session['user_id'];
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);  // show the long and short urls
  }
});

// second route and template
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("This Short URL does not exist!")
  }
  let templateVars = { 
    user: users[req.session["user_id"]],
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL
  };
  if (req.session["user_id"] === urlDatabase[templateVars.shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("This TinyURL isn't yours!");
  }
});

/////
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});
////

// delete button
app.post("/urls/:id/delete", (req,res) => {
  const shortURL = req.params.id;
  if (req.session["user_id"] === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(400).send("Permission denied. You are not allowed to delete that TinyURL!");
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  if (req.session["user_id"] === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).send("Permission denied. Your are not allowed to edit that TinyURL!")
  }
});
/////

app.post("/login", (req,res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user) {
    res.status(403).send("Email cannot be found");
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Wrong password");
  } else {
    res.session('user_id', user.id);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  //res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/register", (req,res) => {
  let templateVars = { user: users[req.session["user_id"]] 
};
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Please enter e-mail or password');
  } else if (getUserByEmail(email, users)) {
    res.status(400).send('This email is already registered!')
  } else {
    const user_id = addUser(email, password);
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

const urlsForUser = (id) => {
  let filtered = {};
  for (let urlID of Object.keys(urlDatabase)) {
    if (urlDatabase[urlID].userID === id) {
      filtered[urlID] = urlDatabase[urlID];
    }
  }
  return filtered;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] 
};
  res.render("urls_login", templateVars);
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
