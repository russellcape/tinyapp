const express = require("express");
const bodyParser = require("body-parser")
var cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.use(cookieParser())

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"], };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`urls/${shortURL}`);
});

function generateRandomString() {
  return Math.random(36).toString(36).slice(2, 8);
};

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  delete res.clearCookie("username", req.body.username)
  res.redirect(`/login`);
});

const findUser = email => {
  for (let userId in users) {
    const currentUser = users[userId];
    if (currentUser.email === email) {
      return currentUser;
    }
  }
  return false;
};

const validationErrors = (email, password) => {
  if (password.length < 6) {
    return 'Please provide a password of at least 6 digits';
  }
  return false;
};

const authenticateUser = (email, password) => {
  const user = findUser(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

  // error can be res.status(401).send('That user already exist!')
  app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  const newUser = { id, email, password }
  if (!findUser(email)) {
    users[id] = newUser;
    res.cookie("user_id", newUser["id"])
    res.redirect(`/urls`);
  } 
  if (findUser(email)) {
    res.render(`register`, {error: "That user Already Exists"})
  }
 });

  
app.get("/register", (req, res) => {
  res.render("register",{error:""});
});

app.post("/login", (req, res) => {
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  res.render("login");;
});