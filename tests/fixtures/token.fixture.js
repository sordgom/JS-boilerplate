const moment = require("moment");
const tokenTypes = require("../../src/models/tokenTypes");
const tokenService = require("../../src/services/token.service");
const config = require("../../src/config/config");
const { testUserA, admin } = require("./user.fixture");

const expires = moment().add(config.jwt.accessExpirationMinutes, "minutes");

const accessToken = tokenService.generateToken(testUserA._id, expires, tokenTypes.ACCESS);

const adminAccessToken = tokenService.generateToken(admin._id, expires, tokenTypes.ACCESS);

module.exports = {
  accessToken,
  adminAccessToken,
};
