var express = require("express");
var app = express();
app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser');


// Express middleware that parses cookies
app.use(cookieParser());


// function to be used by endpoints:

function generateRandomString() {
    checkString = "0123456789abcdefghijklmnopqrstuvwxyz";
    returnString = [];
    for (let i = 0; i < 6; i++) {
      let index = Math.floor(Math.random() * 36);
      returnString = `${returnString}${checkString[index]}`;
    }
    return returnString;
}


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// added during User Registration portion of project:
var users = {
  "guest": {id: "guest", email: "", password: ""}
};


var templateVars = {
      urls: urlDatabase,
      userId: "",
      email: "",
      password: "",
      shortURL: "",
      longURL: ""
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
  res.end("<html><body>Hello <em>World</em></body></html>\n");
});


app.get("/urls", (req, res) => {
  if (req.cookies.userId){
    templateVars.userId = req.cookies.userId;
    templateVars.email = users[req.cookies.userId].email;
    res.render("urls_index", templateVars);
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //   templateVars.email = users.userId.email;
  //   userId: req.cookies.userId,
  //   email: users.userId.email
  // };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  //templateVars.email = users.userId.email;
  templateVars.shortURL = req.params.id;
  templateVars.longURL = urlDatabase[req.params.id]
  // let templateVars = {
  //   userId: req.cookies.userId,
  //   email: users.userId.email,
  //   shortURL: req.params.id,
  //   longURL: urlDatabase[req.params.id]
  // };
  res.render("urls_show", templateVars);
});


// -------- Part 1 functions --------

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: false
}));


app.post("/urls/create", (req, res) => {
  //urlDatabase["xsrif8"] = "https://nodejs.org/en/";
  let theUrl = req.body.longURL;
  if (!(theUrl.slice(0,6) == "http://" || theUrl.slice(0,7) == "https://")) {
    theUrl = `http://${theUrl}`;
  }
  urlDatabase[generateRandomString()] = theUrl;
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


// -------- Part 4 functions --------

app.post("/urls/:id/update", (req, res) => {
  let updatedUrl = req.body.longURL;
  if (!(updatedUrl.slice(0,7) == "http://" || updatedUrl.slice(0,8) == "https://")) {
    updatedUrl = `http://${updatedUrl}`;
  }
  urlDatabase[req.params.id] = updatedUrl;
  res.redirect("/urls");
})


// -------- Login (cookie) functions --------

// app.post("/login", (req, res) => {
//   res.cookie("userId", req.body.userId);
//   res.redirect('/urls');
// })

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  userId = "guest";
  res.redirect('/login');
})

// -------- User Reg functions --------

app.get("/register", (req, res) => {
  // let templateVars = {
  //   email: req.cookies.email,
  //   password: req.cookies.password
  res.render("registration"); //, templateVars);
})

app.post("/register", (req, res) => {
  let newUserID = generateRandomString();
  var entryIssue = false;
  if (!req.body.email || !req.body.password) {
    res.status(400).send('400! Fill in all the blanks please :)');
    entryIssue = true;
    console.log("entryIssue = true");
  } else {
    for (entry in users) {
      if (req.body.email === users[entry].email) {
        res.status(400).send('400! This email address is already registered.');
        entryIssue = true;
        console.log("entryIssue = true");
        break;
      }
    }
  }
  if (!entryIssue) {
    users[newUserID] = {
      userId: newUserID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("userId", newUserID);
    console.log(users);
    // res.redirect('/');   <----- why? coded next line instead.
    res.redirect('/urls');
  }
})

app.get("/login", (req, res) =>{
  res.render("login");
})

app.post("/login", (req, res) => {
  if (req.body.register) {
    console.log('*** register ***');
    res.redirect('/register');
  } else {
    if (!req.body.email || !req.body.password) {
      res.status(400).send('400! Fill in all the blanks please :)');
      entryIssue = true;
      console.log("entryIssue = true");
    } else {
      var allOk = false;
      for (entry in users) {
        if (req.body.email === users[entry].email) {
          if (req.body.password !== users[entry].password) {
            res.status(400).send('Incorrect password, please try again.');
            // some sorta reload operation.
          } else {
            allOk = true;
            res.cookie("userId", users[entry].userId);
            res.redirect('/urls');  // or break and redirect('/urls') at end?
          }
        }
      }
      if (!allOk) {
        res.status(400).send('Email not found.');
      }
    }
  }
})








