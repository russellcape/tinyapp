const express = require("express");
const bodyParser = require("body-parser")
var cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; 

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userId: "user2RandomID" }
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
  // extract user cookie
  //test if user cookie is true or false
  // if undefined rediredct to login
  let templateVars = {urls: urlDatabase[req.body.longURL], user: users[req.cookies["user_id"]]}
  if (users[req.cookies["user_id"]]) {
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login")
  }
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
    if (users[req.cookies["user_id"]]) {
      res.render("urls_index", templateVars); 
    } 
    else {
      res.redirect("/login")
    }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user: users[req.cookies["user_id"]],
  }
  if (users[req.cookies["user_id"]].id !== urlDatabase[req.params.shortURL].userId) {
  // console.log(req.params)
  // console.log(req.params.shortURL)
  // console.log(urlDatabase[req.params.shortURL].longURL)
  // console.log(urlDatabase[req.params.shortURL].userId)
  // console.log(req.cookies['user_id'])
  // console.log(users[req.cookies["user_id"]])
  // console.log(users[req.cookies["user_id"]].id)
    res.status(404).send("The short URL cannot be located in your account");
    return;
  } else {
    res.render("urls_show", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL: shortURL, 
    longURL: req.body.longURL, 
    userId: req.cookies["user_id"]};
    // console.log(urlDatabase)
    // console.log(shortURL)
    // console.log(req.body.longURL)
  res.redirect(`/urls/${shortURL}`);
});

function generateRandomString() {
  return Math.random(36).toString(36).slice(2, 8);
};

app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.cookies["user_id"]].id !== urlDatabase[req.params.shortURL].userId) {
    res.status(404).send("The short URL cannot be altered in your account");
    return;
  } else {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const { longURL, userId } = req.body;
  urlDatabase[req.params.shortURL] = { 
    longURL: longURL, 
    userId: userId 
  }
  res.redirect(`/urls`);
});


app.post("/logout", (req, res) => {
  delete res.clearCookie("user_id", req.body.user)
  res.redirect(`/login`);
});

const findUser = (email) => {
  for (let userId in users) {
    const currentUser = users[userId];
    if (currentUser.email === email) {
      return currentUser;
    }
  }
  return false;
};

// const urlsForUser = (id) => {
//   if (req.cookies['user_id'] === urlDatabase[shortURL].userId) {
//     return urlDatabase
//   }
//   return false
// };


const validationErrors = (email, password) => {
  if (password.length < 6) {
    return 'Please provide a password of at least 6 digits';
  }
  return false;
};

const authenticateUser = (email, password) => {
  const user = findUser(email);
  if (user && user.password === password) {
      return user;
    }
  else {
    return false;
  }
};

  app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  const newUser = { id, email, password }
  if (!findUser(email, password)) {
    users[id] = newUser;
    res.cookie("user_id", newUser.id)
    res.redirect(`/urls`);
    return;
  } 
    res.status(401).render(`register`, {error: ('That user already exist!'), user: null})
 });
  
app.get("/register", (req, res) => {
  res.render("register",{error: "", user: users[req.cookies["user_id"]]});
});

app.post("/login", (req, res) => {
  //extracts email/password
  const { email, password } = req.body;
  //encase the currentUser object in authenticateUser
  const userObj = authenticateUser(email, password)
  if (!userObj) {
    res.status(403).render(`login`, { error: "Incorrect username or password", user: users[req.cookies["user_id"]] })
    return;
  } //logging in with
  res.cookie("user_id", userObj.id)
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  res.render(`login`,{ user: users[req.cookies["user_id"]],  error: "" });;
});