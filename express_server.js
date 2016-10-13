var express = require("express");
var app = express();
app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  //"xsrif8": "https://nodejs.org/en/"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});


// -------- Part 1 functions --------

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());


app.post("/urls", (req, res) => {
  urlDatabase["xsrif8"] = "https://nodejs.org/en/";
  res.redirect("/urls");
});



// -------- Part 2 functions --------

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if(longURL)
  {
    res.redirect(longURL);
  }
  else
  {
    res.status(404).send('Not found');
  }
});


// -------- Part 3 functions --------

app.post("/urls/:id/delete", (req, res) => {
  //console.log("Made it to the endpoint.");
  // Delete the whole url with the key
  delete urlDatabase[req.params.id];
  //console.log(`${urlDatabase.[req.params.id]} deleted.`);
  // use redirect to reload the /urls page
  res.redirect("/urls");
})




