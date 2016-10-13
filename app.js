const http = require("http");
const PORT = 8080;

// a function which handles requests and sends response
// **INITIAL VERSION**
// function requestHandler(request, response) {
//   response.end(`Requested Path: ${request.url}\nRequest Method: ${request.method}`);
// }
// **MODIFIED VERSION**
function requestHandler(request, response) {
   if (request.url == "/") {
    response.end("Welcome!");
  } else if (request.url == "/urls") {
    response.end("www.lighthouselabs.ca\nwww.google.com");
  } else {
    response.statusCode = 404;
    response.end("Unknown Path");
  }
}

var server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});


function generateRandomString() {
    checkString = "0123456789abcdefghijklmnopqrstuvwxyz";
    returnString = [];
    for (let i = 0; i < 6; i++) {
      let index = Math.floor(Math.random() * 36);
      returnString = `${returnString}${checkString[index]}`;
    }
    return returnString;
}

