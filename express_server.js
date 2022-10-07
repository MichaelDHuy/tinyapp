const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
cookieSession = require('cookie-session')
const PORT = 8080; // default port 8080
const getUserByEmail = require('./helpers.js')
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'user_id',
  keys: ["1234", "5678"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const generateRandomString = function() {
  const char = "QWERTYUIOPLKJHGFDSAZXCVBNMqwertyuioplkjhgfdsazxcvbnm1234567890";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomChar = Math.floor(Math.random() * char.length);
    randomString += char[randomChar];
  }
  return randomString;
};
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "5678",
  },
};

// const getUserByEmail = (mail) => {
//   for (let user in users) {
//     if(users[user].email === mail) {
//       return users[user];
//     }
//   }
//   return null;
// };

const urlsForUser = (id) => {
  let userURLS = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURLS[url] =urlDatabase[url]
    }
  }
  return userURLS;
};

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("<html><body>Please <a href=/login>Log In</a> or <a href=/register>Register</a> to create a URL.</body></html>");
    return;
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/${shortURL}`);
  return;
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    res.send("<html><body>Please <a href=/login>Log In</a> or <a href=/register>Register</a> to delete a URL.</body></html>");
    return;
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  if (!req.session.user_id) {
    res.send("<html><body>Please <a href=/login>Log In</a> or <a href=/register>Register</a> to update a URL.</body></html>");
    return;
  }
  const id = req.params.id;
  console.log('req.body', req.body);
  urlDatabase[id].longURL = req.body.urlupdate;
  console.log('url databe update', urlDatabase)
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  
  if (!email || !password) {
    return res.status(400).send("<html><body>Please include email AND password. <a href=/login>Try Again</a>!</body></html>");
  }
  if (!user) {
    return res.status(403).send("<html><body>An account with that email does not exist! Please <a href=/login>Try Again</a>!</body></html> ");
  }
  const comparePassword = bcrypt.compareSync(password, user.password);
  if (user && !comparePassword) {
    return res.status(403).send("<html><body>The password you entered is incorrect! Please <a href=/login>Try Again</a>!</body></html>");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const emailExisted =  getUserByEmail(email, users);
  if (email === "" || password === "") {
    return res.status(403).send("<html><body>Please include email AND password. <a href=/register>Try Again</a>)!</body></html>");
  }
  if (emailExisted) {
    return res.status(403).send("<html><body>Email is already in use. Please <a href=/register>Try Again</a>)!</body></html>");
  }
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  // users[id] = user;
  console.log(users);
  req.session.user_id = id;
  res.redirect('/urls');
})

app.get("/u/:id", (req, res) => {
  for (let url in urlDatabase) {
    if (req.params.id === url) {
      const longURL = urlDatabase[req.params.id].longURL;
      res.redirect(longURL);
      return;
    }
  };
    res.send("ID does not exist. Please try again!");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("<html><body>Please <a href=/login>Log In</a> or <a href=/register>Register</a> to create a URL.</body></html>");
  }
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  console.log('urlsforuser', urlsForUser(req.session.user_id));
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id]
  }; 
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("<html><body>Please <a href=/login>Log In</a> or <a href=/register>Register</a> to create a URL.</body></html>");
  }
  let permittedView = urlsForUser(req.session.user_id);
  if (!permittedView) {
    return res.status(401).send("<html><body>Sorry! You do not have permission to view this URL! Please <a href=/login>Log In</a> or <a href=/register>Register</a>.</body></html>");
  }
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[`${req.params.id}`].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});