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
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies["user_id"] };
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

// app.post("/login", (req, res) => {
//   res.cookie("user_id", req.body.user)
//   res.redirect(`/urls`);
// });

app.post("/logout", (req, res) => {
  delete res.clearCookie("user_id", req.body.user)
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
  if (user && password) {
    return user;
  } else {
    return false;
  }
};

  app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  const newUser = { id, email, password }
  if (!findUser(email)) {
    users[id] = newUser;
    res.cookie("user_id", newUser.id)
    res.redirect(`/urls`);
    return;
  } //error: "That user Already Exists"
    //res.status(400).send('That user already exist!')
    res.render(`register`, {error: res.status(400).send('That user already exist!'), user: null})
 });
  
app.get("/register", (req, res) => {
  res.render("register",{error: "", user: users[req.cookies["user_id"]]});
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!authenticateUser(email, password)) {
  res.render(`login`, { error:  res.status(403).send("Incorrect username or password"), user: users[req.cookies["user_id"]] })
  return
}
  //res.send(req.body)
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  res.render(`login`,{ user: users[req.cookies["user_id"]],  error: "" });;
});