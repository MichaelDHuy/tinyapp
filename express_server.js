const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

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
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
// const users = {};
// const cookieLookup = (userIDCookie) => {
//   for (let user in users) {
//     if (userIDCookie === user) {
//       return users[user];
//     }
//   }
// };

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const getUserByEmail = (mail) => {
  for (let user in users) {
    if(users[user].email === mail) {
      return users[user];
    }
  }
  return null;
};

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
  if (!req.cookies["user_id"]) {
    res.send("Please log in or register to create a new URL!");
    return;
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  res.redirect(`/urls/${shortURL}`);
  return;
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.send("Please log in or register to delete a URL!");
    return;
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.send("Please log in or register to update a URL!");
    return;
  }
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.update;
  res.redirect(`/urls/${id}`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email)
  if (!email || !password) {
    return res.status(400).send('Please include email AND password!');
  }
  if (!user) {
    return res.status(403).send('An account with that email does not exist!');
  }
  if (user && user.password !== password) {
    return res.status(403).send('The password you entered is incorrect!')
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  // create a new user object
  const email = req.body.email;
  const password = req.body.password;

  const emailExisted =  getUserByEmail(email);
  if (email === "" || password === "") {
    return res.status(403).send('Please include email AND password');
  }
  if (emailExisted) {
    return res.status(403).send('Email is already in use');
  }
  const id = generateRandomString();
  const user = {
    id,
    email,
    password
  };
  users[id] = user;
  console.log(users);
  // After adding the user, set a user_id cookie containing the user's newly generated ID.
  // Test that the users object is properly being appended to. You can insert a console.log
  res.cookie("user_id", user.id);
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
  if (!req.cookies["user_id"]) {
    return res.status(401).send("Please log in to continue!");
  }
  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  }; 
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(401).send("Please log in to continue!");
  }
  let permittedView = urlsForUser(req.cookies["user_id"]);
  if (!permittedView) {
    return res.status(401).send("Sorry! You do not have permission to view this URL!");
  }
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[`${req.params.id}`].longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.cookies["user_id"]]
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
