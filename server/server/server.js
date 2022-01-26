const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./../routes/index");

const app = express();

const allowedOrigins = ['http://localhost:400'];

const options = {
  origin: allowedOrigins
};

app.use(cors());

const io = (app.io = require("socket.io")());

app.use(passport.initialize());
require("./../config/passport")(passport);

app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes registration
routes(app);

module.exports = app;
