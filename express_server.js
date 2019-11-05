const express = require("express");
const bodyParser = require("body-parser")
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; 

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userId: "user2RandomID"}
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

//          App use / set / and the basic's

app.use(cookieSession({
  name: 'session',
  keys: ["nakgnresnmgsrnhg;roiesnvnsevnsavlsj"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


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

// Connect with server

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Functions

const generateRandomString = function() {
  return Math.random(36).toString(36).slice(2, 8);
};

const findUser = (email) => {
  for (let userId in users) {
    const currentUser = users[userId];
    if (currentUser.email === email) {
      return currentUser;
    }
  }
  return false;
};

const urlsForUser = (id) => {
  let validURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userId === id) {
      validURLs[key] = urlDatabase[key]
    } 
  }
  return validURLs;
};

// currently unused...
// const passwordValidation = (email, password) => {
//   if (password.length < 7) {
//     return true;
//   }
//   return false;
// };

const authenticateUser = (email, password) => {
  const user = findUser(email);
  if (user && bcrypt.compareSync(password, user.password)) {
      return user;
    }
  else {
    return false;
  }
};

// Main TinyApp

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  //console.log(longURL)
  res.redirect(longURL); 
});

app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase[req.body.longURL], user: users[req.session.user_id]}
  if (users[req.session.user_id]) {
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login")
  }
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id),
     error: null, 
     user: users[req.session.user_id]
    };
  if (users[req.session.user_id]) {
    res.render("urls_index", templateVars); 
  } 
  if (!req.session.user_id) {
    res.redirect("/login")
  }
});

// submit new url button
app.get("/urls/:shortURL", (req, res) => {
      if (req.session.user_id) {
      let templateVars = { 
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL].longURL, 
        user: users[req.session.user_id]
      };
      res.render("urls_show", templateVars);
  } else {
    res.status(404).send("please login or register to view this short link")
  }
});

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  urlDatabase[shortURL] = { 
    longURL: req.body.longURL, 
    userId: users[req.session.user_id].id};
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userId) {
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls`);
  } else {
  res.status(400).render(`urls_index`, {urls: urlDatabase, error: "The short URL cannot be accessed your account", user: users[req.session.user_id]} )
  }
});

app.post("/logout", (req, res) => {
  delete res.clearCookie("user_id", req.body.user)
  res.redirect(`/login`);
});

// edit submit button
app.post('/urls/:shortURL', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userId) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
  }
  else {
    res.redirect("/login")
  }
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  const newUser = { id, email, password: bcrypt.hashSync(password, 10) };
  if (!findUser(email, password)) {
    users[id] = newUser;
    req.session.user_id = newUser['id'];
    res.redirect(`/urls`);
    return;
  } 
    res.status(401).render(`register`, {error: ('That user already exist!'), user: null})
});
  
app.get("/register", (req, res) => {
  res.render("register",{error: "", user: users[req.session.user_id]});
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userObj = authenticateUser(email, password)
  if (!userObj) {
    res.status(403).render(`login`, { error: "Incorrect username or password", user: users[req.session.user_id] })
    return;
  }
  res.session.user_id = userObj.id
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  res.render(`login`,{ user: users[req.session.user_id],  error: "" });;
});
