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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.update;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
})

app.post("/urls/logout", (req, res) =>{
  res.clearCookie("username");
  res.redirect("/urls");
})

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
  }; 
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[`${req.params.id}`],
    username: req.cookies["username"] 
  };
  res.render("urls_show", templateVars);
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
