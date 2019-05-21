const express = require("express");
const fs = require("fs");
const path = require("path");
const config = require("config");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");

const index = require("./routes/index");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/", index);

app.use(express.static(__dirname + "/public"));
app.use(helmet());

if (config.get("environment") == "development environment") {
  console.log("App is running in " + config.get("environment"));

  let accessLogStream = fs.createWriteStream(
    path.join(__dirname + "/logs", "access.log"),
    { flags: "a" }
  );

  app.use(morgan("combined", { stream: accessLogStream }));
}

app.use((req, res) => {
  res.status(404).send("I think you are lost in the desert right now!!!");
});

const port = process.env.PORT || 8300;
app.listen(port, () => {
  console.log(`app listening on port ${port} ...`);
});
