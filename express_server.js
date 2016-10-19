// Essential requirements
var express = require("express");
var app = express();
app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080;
var cookieSession = require('cookie-session');

// For encrypting passwords:
const bcrypt = require('bcrypt');


// Bodyparser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: false
}));

// Express middleware that parses cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


// Function to be used by endpoints to generate user Ids
function generateRandomString() {
    let checkString = "0123456789abcdefghijklmnopqrstuvwxyz";
    let returnString = [];
    for (let i = 0; i < 6; i++) {
      let index = Math.floor(Math.random() * 36);
      returnString = `${returnString}${checkString[index]}`;
    }
    return returnString;
}

// Database of URLs, initialized with two defaults
var urlDatabase = {
  "b2xVn2": {link: "http://www.lighthouselabs.ca", id: ""},
  "9sm5xK": {link: "http://www.google.com", id: ""}
};

// Database of users:
var users = { // object format below:
 // "guest": {id: "guest", email: "", password: ""}
};

// The object usually used to deliver info to the front end:
var templateVars = {
      urls: urlDatabase,
      userId: "",
      email: "",
      password: "",
      shortURL: "",
      longURL: ""
    };


// listening function, pings the port number.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// ----- //


/* GET functions */

// Splash page
app.get("/", (req, res) => {
  res.end("<html><body><h4>Hello!</h4><a href=\"/urls\">Go to list of URLs</a><body><html>");
});

// To view a JSON formatted list:
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Hello page (sample, not part of user flow)
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <em>World</em></body></html>\n");
});

// Page that displays all shortened URLs currently on the server:
app.get("/urls", (req, res) => {
  if (req.session.userId){
    templateVars.userId = req.session.userId;
    templateVars.email = users[req.session.userId].email;
  } else {
    templateVars.userId = "";
    templateVars.email = "";
  }
  res.render("urls_index", templateVars);
});

// Page that displays all shortened URLs added / edited by the currently logged in user:
app.get("/urls/user", (req, res) => {
  templateVars.userId = req.session.userId;
  templateVars.email = users[req.session.userId].email;
  res.render("urls_user", templateVars);
});

// Page for a user to create a new URL:
app.get("/urls/new", (req, res) => {
  res.render("urls_new", templateVars);
});

// Page for a user edit a specific URL they have added:
app.get("/urls/:id", (req, res) => {
  templateVars.shortURL = req.params.id;
  templateVars.longURL = urlDatabase[req.params.id].link;
  res.render("urls_show", templateVars);
});

// ** Potentially to be removed as not currently part of user flow: **
// URL to type in to load the longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].link;
  if(longURL)
  {
    res.redirect(longURL);
  }
  else
  {
    res.status(404).send('Not found');
  }
});

// Loads user registration page:
app.get("/register", (req, res) => {
  res.render("registration");
})

// Loads "pure" login page:
app.get("/login", (req, res) =>{
  res.render("login");
})


// ----- //


/* POST functions */

// Creates a new shortURL
app.post("/urls/create", (req, res) => {
  let theUrl = req.body.longURL;
  if (!(theUrl.slice(0,6) == "http://" || theUrl.slice(0,7) == "https://")) {
    theUrl = `http://${theUrl}`;
  }
  urlDatabase[generateRandomString()] = {link: theUrl, id: req.session.userId};
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

// Updates a user's ShortURL
app.post("/urls/:id/update", (req, res) => {
  let updatedUrl = req.body.longURL;
  if (!(updatedUrl.slice(0,7) == "http://" || updatedUrl.slice(0,8) == "https://")) {
    updatedUrl = `http://${updatedUrl}`;
  }
  urlDatabase[req.params.id].link = updatedUrl;
  res.redirect("/urls");
})


// Registers a new user
app.post("/register", (req, res) => {
  let newUserID = generateRandomString();
  var entryIssue = false;
  if (!req.body.email || !req.body.password) {
    // rather unsightly and repetitive...?
    let line1 = "<p>400! Fill in all the blanks please :)</p>";
    let line2 = "<div><a href=\"/register\">Retry</a></div></body></html>";
    let line3 = "<div><a href=\"/login\">Login</a></div>";
    res.status(400).send(`<html><body>${line1}${line2}${line3}</body></html>`);
    entryIssue = true;
  } else {
    for (entry in users) {
      if (req.body.email === users[entry].email) {
        // rather unsightly and repetitive...?
        let line1 = "<p>400! This email address is already registered.</p>";
        let line2 = "<div><a href=\"/register\">Retry</a></div></body></html>";
        let line3 = "<div><a href=\"/login\">Login</a></div>";
        res.status(400).send(`<html><body>${line1}${line2}${line3}</body></html>`);
        entryIssue = true;
        break;
      }
    }
  }
  if (!entryIssue) {
    const password = req.body.password;
    const hashed_password = bcrypt.hashSync(password, 10);
    users[newUserID] = {
      userId: newUserID,
      email: req.body.email,
      password: hashed_password
    };
    req.session.userId = newUserID;
    res.redirect('/urls');
  }
})


// Logs a user in
app.post("/login", (req, res) => {
  if (req.body.register) {
    res.redirect('/register');
  } else {
    if (!req.body.email || !req.body.password) {
      // rather unsightly and repetitive...?
      let line1 = "<p>400! Fill in all the blanks please :)</p>";
      let line2 = "<div><a href=\"/login\">Retry</a></div></body></html>";
      let line3 = "<div><a href=\"/register\">Register</a></div>";
      res.status(400).send(`<html><body>${line1}${line2}${line3}</body></html>`);
    } else {
      var allOk = false;
      for (entry in users) {
        if (req.body.email === users[entry].email) {
         if (!bcrypt.compareSync(req.body.password, users[entry].password)) {
            // rather unsightly and repetitive...?
            let line1 = "<p>Incorrect password, please try again.</p>";
            let line2 = "<div><a href=\"/login\">Retry</a></div></body></html>";
            let line3 = "<div><a href=\"/register\">Register</a></div>";
            res.status(400).send(`<html><body>${line1}${line2}${line3}</body></html>`);
          } else {
            allOk = true;
            req.session.userId = users[entry].userId;
            res.redirect('/urls');
          }
        }
      }
      if (!allOk) {
        // rather unsightly and repetitive...?
        let line1 = "<p>400! Email not found.</p>";
        let line2 = "<div><a href=\"/login\">Retry</a></div></body></html>";
        let line3 = "<div><a href=\"/register\">Register</a></div>";
        res.status(400).send(`<html><body>${line1}${line2}${line3}</body></html>`);
      }
    }
  }
})


// Logs a user out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
})



