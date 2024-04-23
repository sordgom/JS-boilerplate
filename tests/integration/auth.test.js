const request = require("supertest");
const faker = require("faker");
const httpStatus = require("http-status");
const moment = require("moment");
const app = require("../../src/app");
const { testUserA, insertUsers } = require("../fixtures/user.fixture");
const config = require("../../src/config/config");
const tokenTypes = require("../../src/models/tokenTypes");
const { tokenService } = require("../../src/services");
const setupDb = require("../setupDb");
const User = require("../../src/models/user.model");
const Token = require("../../src/models/token.model");

setupDb();

describe("Testing the auth endpoints", () => {
  describe("POST /v1/auth/register", () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: "password1",
      };
    });

    test("Should be successful if everything is correct", async () => {
      const res = await request(app).post("/v1/auth/register").send(newUser).expect(httpStatus.CREATED);

      expect(res.body).not.toHaveProperty("password");
      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: newUser.name,
        email: newUser.email,
        role: "user",
        isEmailVerified: false,
      });

      const dbUser = await User.findById(res.body.user.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        name: newUser.name,
        email: newUser.email,
        role: "user",
        isEmailVerified: false,
      });
      expect(res.body.token).toEqual({
        access: {
          token: expect.anything(),
          expires: expect.anything(),
        },
        refresh: {
          token: expect.anything(),
          expires: expect.anything(),
        },
      });
    });
  });

  describe("POST /v1/auth/login", () => {
    test("should return 200 and login user if email and password match", async () => {
      await insertUsers([testUserA]);
      const loginCredentials = { email: testUserA.email, password: testUserA.password };
      const res = await request(app).post("/v1/auth/login").send(loginCredentials).expect(httpStatus.OK);

      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: testUserA.name,
        email: testUserA.email,
        role: testUserA.role,
        isEmailVerified: testUserA.isEmailVerified,
      });

      expect(res.body.token).toEqual({
        access: {
          token: expect.anything(),
          expires: expect.anything(),
        },
        refresh: {
          token: expect.anything(),
          expires: expect.anything(),
        },
      });
    });

    test("should return 401 error if there are no users with that email", async () => {
      const loginCredentials = { email: testUserA.email, password: testUserA.password };

      const res = await request(app).post("/v1/auth/login").send(loginCredentials).expect(httpStatus.UNAUTHORIZED);
      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: "Incorrect email or password",
      });
    });

    test("should return 401 error if password is wrong", async () => {
      await insertUsers([testUserA]);
      const loginCredentials = { email: testUserA.email, password: "wrongPassword" };

      const res = await request(app).post("/v1/auth/login").send(loginCredentials).expect(httpStatus.UNAUTHORIZED);
      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: "Incorrect email or password",
      });
    });
  });

  describe("POST /v1/auth/logout", () => {
    test("should return 204 and no content if refresh token is valid", async () => {
      await insertUsers([testUserA]);
      const expires = moment().add(config.jwt.refreshExpirationMinutes, "minutes");
      const refreshToken = tokenService.generateToken(testUserA._id, expires, tokenTypes.REFRESH);
      await tokenService.storeToken(refreshToken, testUserA._id, expires, tokenTypes.REFRESH);

      await request(app).post("/v1/auth/logout").send({ refreshToken }).expect(httpStatus.NO_CONTENT);

      const token = await Token.findOne({ token: refreshToken });
      expect(token).toBe(null);
    });

    test("should return 400 error if refresh token is missing from request body", async () => {
      await request(app).post("/v1/auth/logout").send().expect(httpStatus.BAD_REQUEST);
    });

    test("should return 404 error if refresh token is not found in the database", async () => {
      await insertUsers([testUserA]);
      const expires = moment().add(config.jwt.refreshExpirationMinutes, "minutes");
      const refreshToken = tokenService.generateToken(testUserA._id, expires, tokenTypes.REFRESH);

      await request(app).post("/v1/auth/logout").send({ refreshToken }).expect(httpStatus.NOT_FOUND);
    });
  });
});
