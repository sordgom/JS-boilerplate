const express = require("express");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
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

app.use("/", routes);

module.exports = app;
