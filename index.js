const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const redisClient = require("redis").createClient();
var TinyURL = require("tinyurl");

app.use(
  "/socket.io",
  express.static(__dirname + "node_modules/socket.io-client/dist/")
);

app.get("/", (req, res) => {
  res.render("main");
});

app.post("/", (req, res) => {
  let longUrl = req.body["url-input"];

  TinyURL.shorten(longUrl, function(shortUrl) {
    redisClient.hmset(
      longUrl,
      {
        longUrl: longUrl,
        shortUrl: shortUrl,
        clicks: 0
      },
      (err, data) => {
        // getting ALL keys from redis
        let keyArray = [];
        redisClient.keys("*", (err, keys) => {
          keys.forEach(longUrl => {
            keyArray.push(longUrl);
          });
          var params = [];
          keyArray.forEach(longUrl => {
            console.log("longUrl is " + longUrl);
            redisClient.hgetall(longUrl, (err, obj) => {
              params.push(obj);
            });
          });

          let paramsObj = {
            params: params
          };
          res.render("main", paramsObj);
        });
      }
    );
  });
});

io.on("connection", client => {
  console.log("New connection!");

  // client.emit("new count", count);
  //
  // // NEW CODE BELOW!
  // client.on("increment", () => {
  //   count++;
  //   io.emit("new count", count);
  // });
  //
  // client.on("decrement", () => {
  //   count--;
  //   io.emit("new count", count);
  // });
  // NEW CODE ABOVE!!
});

server.listen(3000);
// app.listen(3000, "localhost", () => {});
