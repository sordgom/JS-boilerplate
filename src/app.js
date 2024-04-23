const express = require("express");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const passport = require("passport");
const httpStatus = require("http-status");
const compression = require("compression");
const cors = require("cors");

const { jwtStrategy } = require("./config/passport");
const { errorConverter, errorHandler } = require("./middleware/error");
const routes = require("./routes");
const morgan = require("./config/morgan");
const config = require("./config/config");
const ApiError = require("./utils/error");

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

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// Version 1 of the API
app.use("/v1", routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed; and handle errors
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
