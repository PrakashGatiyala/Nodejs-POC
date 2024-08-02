const http = require("http");
const fs = require("fs");

const BLOCKED_DURATION = 2 * 60 * 1000;
const MAX_REQUESTS = 10;
const REQUEST_INTERVAL = 1 * 60 * 1000;

let requests = {};

const server = http.createServer((req, res) => {
  const url = req.url;
  if (url === "/favicon.ico") {
    res.statusCode = 404;
    return res.end("Not Found");
  }
  const ip = req.socket.remoteAddress;

  if (!requests[ip]) {
    requests[ip] = { requestTimeStamp: [], blocked: false, blockedUntil: null };
  }
  let userRequestInfo = requests[ip];

  if (userRequestInfo.blocked) {
    if (Date.now() < userRequestInfo.blockedUntil) {
      res.statusCode = 423;
      return res.end(
        `Access locked for ${
          (userRequestInfo.blockedUntil - Date.now()) / 1000
        } seconds`
      );
    } else {
      userRequestInfo.blocked = false;
      userRequestInfo.blockedUntil = null;
    }
  }

  userRequestInfo.requestTimeStamp = userRequestInfo.requestTimeStamp.filter(
    (item) => Date.now() - item < REQUEST_INTERVAL
  );

  if (userRequestInfo.requestTimeStamp.length >= MAX_REQUESTS) {
    userRequestInfo.blocked = true;
    userRequestInfo.blockedUntil = Date.now() + BLOCKED_DURATION;
    res.statusCode = 429;
    return res.end("Too many requests");
  }

  userRequestInfo.requestTimeStamp.push(Date.now());

  const dateTime = new Date();
  const date =
    dateTime.getDate() +
    "/" +
    (dateTime.getMonth() + 1) +
    "/" +
    dateTime.getFullYear();
  const time =
    dateTime.getHours() +
    ":" +
    dateTime.getMinutes() +
    ":" +
    dateTime.getSeconds();

  try {
    let logEntry = `${date.toString()}, ${time}, ${url}, ${ip}, 200\n`;
    switch (url) {
      case "/":
        res.statusCode = 200;
        fs.appendFileSync("log.csv", logEntry);
        return res.end("Hello World");
      case "/about":
        res.statusCode = 200;
        fs.appendFileSync("log.csv", logEntry);
        return res.end("About Us");
      case "/contact":
        res.statusCode = 200;
        fs.appendFileSync("log.csv", logEntry);
        return res.end("Contact Us");
      default:
        res.statusCode = 404;
        logEntry = `${date.toString()}, ${time}, ${url}, ${ip}, 404\n`;
        fs.appendFileSync("log.csv", logEntry);
        return res.end("Page Not Found");
    }
  } catch (err) {
    res.statusCode = 500;
    const errorLog = `${date.toString()}, ${time}, ${url}, ${ip}, ${err.toString()},  500\n`;
    fs.appendFileSync("error.txt", errorLog);
    return res.end(errorLog);
  }
});

server.listen(8000, () => {
  console.log("Server is running on port 8000");
});
