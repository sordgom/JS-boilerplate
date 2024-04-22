const express = require("express");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require('helmet');
const passport = require('passport');

const routes = require("./routes");
const morgan = require("./config/morgan");
const config = require("./config/config");

const app = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Sanitize request data
app.use(xss());
app.use(mongoSanitize());

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Version 1 of the API
app.use("/v1", routes);

module.exports = app;
