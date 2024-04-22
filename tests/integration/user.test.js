const faker = require("faker");
const request = require("supertest");
const httpStatus = require("http-status");

const { insertUsers, admin, testUserA, testUserB } = require("../fixtures/user.fixture");
const { adminAccessToken, accessToken } = require("../fixtures/token.fixture");
const app = require("../../src/app");
const setupDB = require("../setupDb");
const User = require("../../src/models/user.model");

setupDB();

describe("Testing the user endpoints", () => {
  describe("POST /v1/users", () => {
    let user;
    beforeEach(() => {
      user = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: "password1",
        role: "user",
      };
    });

    // These routes are supposed to be exposed to admin/system only
    test("Should be successful if everything's correct", async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(user)
        .expect(httpStatus.CREATED);

      expect(res.body).not.toHaveProperty("password");
      expect(res.body).toEqual({
        id: expect.anything(),
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: false,
      });

      const dbUser = await User.findById(res.body.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(user.password);
      expect(dbUser).toMatchObject({ name: user.name, email: user.email, role: user.role, isEmailVerified: false });
    });

    test("Should be able to create new admins", async () => {
      await insertUsers([admin]);

      user.role = "admin";

      const response = await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(user)
        .expect(httpStatus.CREATED);

      expect(response.body.role).toBe("admin");

      const dbUser = await User.findById(response.body.id);
      expect(dbUser.role).toBe("admin");
    });

    test("Should return 409 if email is already taken", async () => {
      await insertUsers([admin, user]);

      const response = await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(user)
        .expect(httpStatus.CONFLICT);

      expect(response.body).toEqual({
        code: httpStatus.CONFLICT,
        message: "Email already taken",
      });
    });

    test("Should return 400 if password is weak", async () => {
      await insertUsers([admin]);

      user.password = "password";

      const response = await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(user)
        .expect(httpStatus.BAD_REQUEST);

      expect(response.body).toEqual({
        code: httpStatus.BAD_REQUEST,
        message: "password must contain at least 1 letter and 1 number",
      });
    });

    test("Should return 400 if password is less than 8 characters", async () => {
      await insertUsers([admin]);

      user.password = "pass1";

      const response = await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send(user)
        .expect(httpStatus.BAD_REQUEST);

      expect(response.body).toEqual({
        code: httpStatus.BAD_REQUEST,
        message: "password must be at least 8 characters",
      });
    });
  });

  describe("GET /v1/users", () => {
    test("should return 200 and apply the default query options", async () => {
      await insertUsers([testUserA, testUserB, admin]);

      const res = await request(app)
        .get("/v1/users")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: expect.any(Number),
        totalResults: expect.any(Number),
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0]).toEqual({
        id: testUserA._id.toHexString(),
        name: testUserA.name,
        email: testUserA.email,
        role: testUserA.role,
        isEmailVerified: testUserA.isEmailVerified,
      });
    });

    test("should return 401 if access token is missing", async () => {
      await insertUsers([testUserA, testUserB, admin]);

      await request(app).get("/v1/users").send().expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 403 if a non-admin is trying to access all users", async () => {
      await insertUsers([testUserA, testUserB, admin]);

      await request(app).get("/v1/users").set("Authorization", `Bearer ${accessToken}`).send().expect(httpStatus.FORBIDDEN);
    });

    test("should correctly apply filter on name field", async () => {
      await insertUsers([testUserA, testUserB, admin]);

      const res = await request(app)
        .get("/v1/users")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .query({ name: testUserA.name })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: expect.any(Number),
        totalResults: 1,
      });
      expect(res.body.results[0]).toEqual({
        id: testUserA._id.toHexString(),
        name: testUserA.name,
        email: testUserA.email,
        role: testUserA.role,
        isEmailVerified: testUserA.isEmailVerified,
      });
    });

    test("should correctly sort the returned array if descending sort param is specified", async () => {
      await insertUsers([testUserA, testUserB, admin]);

      const res = await request(app)
        .get("/v1/users")
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .query({ sortBy: "role:desc" })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: expect.any(Number),
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(testUserA._id.toHexString());
      expect(res.body.results[1].id).toBe(testUserB._id.toHexString());
      expect(res.body.results[2].id).toBe(admin._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
        await insertUsers([testUserA, testUserB, admin]);
    
        const res = await request(app)
            .get('/v1/users')
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .query({ page: 2, limit: 2 })
            .send()
            .expect(httpStatus.OK);
    
        expect(res.body).toEqual({
            results: expect.any(Array),
            page: 2,
            limit: 2,
            totalPages: expect.any(Number),
            totalResults: 3,
        });
        expect(res.body.results).toHaveLength(1);
        expect(res.body.results[0]).toEqual({
            id: admin._id.toHexString(),
            name: admin.name,
            email: admin.email,
            role: admin.role,
            isEmailVerified: admin.isEmailVerified,
        });
        });
  });
});
