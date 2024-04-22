const faker = require("faker");
const request = require("supertest");
const httpStatus = require('http-status');

const { insertUsers, admin} = require("../fixtures/user.fixture");
const { adminAccessToken } = require("../fixtures/token.fixture");
const app = require('../../src/app');
const setupDB = require('../setupDb');
const User = require('../../src/models/user.model');

setupDB();

describe('Testing the user endpoints', () => {
    describe('POST /v1/users', () => {
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
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(user)
                .expect(httpStatus.CREATED);
        
            expect(res.body).not.toHaveProperty('password');
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
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(user)
                .expect(httpStatus.CREATED);

            expect(response.body.role).toBe("admin");

            const dbUser = await User.findById(response.body.id);
            expect(dbUser.role).toBe("admin");
        });

        test("Should return 409 if email is already taken", async () => {
            await insertUsers([admin, user]);

            const response = await request(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
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
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(user)
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body).toEqual({
                code: httpStatus.BAD_REQUEST,
                message: "Password must be at least 8 characters long, and contain at least one letter and one number",
            });
        });

        test("Should return 400 if password is less than 8 characters", async () => {
            await insertUsers([admin]);

            user.password = "pass1";

            const response = await request(app)
                .post('/v1/users')
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send(user)
                .expect(httpStatus.BAD_REQUEST);

            expect(response.body).toEqual({
                code: httpStatus.BAD_REQUEST,
                message: "Password must be at least 8 characters long, and contain at least one letter and one number",
            });
        });

    });
});