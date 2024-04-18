const winston = require("winston");
const config = require("./config");

const errorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: config.env === "development" ? "debug" : "info",
  format: winston.format.combine(
    errorFormat(),
    config.env === "development" ? winston.format.colorize() : winston.format.simple(),
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/info.log",
      level: "info",
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
  ],
});

module.exports = logger;
