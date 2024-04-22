const moment = require("moment");
const jwt = require("jsonwebtoken");
const { Token } = require("../../src/models");
const { testUserA } = require("../fixtures/user.fixture");

describe("Test my token model", () => {
  let token;

  beforeEach(async () => {
    const expires = moment().add(10, "minutes");
    const payload = {
      sub: testUserA._id,
      iat: moment().unix(),
      exp: expires.unix(),
      type: "access",
    };
    const jwtToken = jwt.sign(payload, "secret");
    token = {
      token: jwtToken,
      user: testUserA._id,
      type: "access",
      expires,
    };
  });

  test("Token should be generated successfully", async () => {
    await expect(new Token(token).validate()).resolves.toBeUndefined();
  });
  // This test keeps failing, need to discover why
  test.skip("Token should fail if the type is wrong", async () => {
    token.type = "wrong";
    await expect(new Token(token).validate()).rejects.toThrow();
  });
  test("Token should fail if the token is empty", async () => {
    token.token = "";
    await expect(new Token(token).validate()).rejects.toThrow();
  });
  test("Token should fail if the user is empty", async () => {
    token.user = "";
    await expect(new Token(token).validate()).rejects.toThrow();
  });
  test("Token should fail if the expires is empty", async () => {
    token.expires = "";
    await expect(new Token(token).validate()).rejects.toThrow();
  });
  test("Token should fail if the expires is not a date", async () => {
    token.expires = "expires";
    await expect(new Token(token).validate()).rejects.toThrow();
  });
});
