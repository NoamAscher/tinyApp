var express = require("express");
var app = express();
app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser');

// Express middleware that parses cookies

// app.use((req, res, next) => {
//    req.cookies = new cookieParser( req, res, {"username": username} );
//    next();
//  })

app.use(cookieParser());

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
  let templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies.username,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});


// -------- Part 1 functions --------

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: false
}));

/*
app.put('/wizards/:id', (req, res) => {
  const id = Number(req.params.id);
  const wizard = wizDb.find((wiz) => {
    return wiz.id === id;
  });
  // This is where we update the wizard (update the database)
  wizard.real_name = req.body.real_name;
  // Because we're handling a post request, we need to redirect
  res.redirect(`/wizards/${wizard.id}`);
});
*/

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


// -------- Login functions --------



app.post("/login", (req, res) => {
  console.log("username", req.body.username);

    res.cookie("username", req.body.username);

  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  //console.log("username", req.body.username);
  res.clearCookie("username");
  res.redirect('/');
})

