const faker = require('faker');
const { User } = require('../../src/models');

describe('user model', () => {
    // Create a new user
    let user = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',    
    };
    beforeEach(() => user);

    test('should validate a valid user', async () => {
        await expect(new User(user).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if email is invalid', async () => {
        user.email = 'invalid';
        await expect(new User(user).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password length is less than 8 characters', async () => {
        user.password = 'passwo1';
        await expect(new User(user).validate()).rejects.toThrow();
    });
  
    test('should throw a validation error if password does not contain numbers', async () => {
        user.password = 'password';
        await expect(new User(user).validate()).rejects.toThrow();
    });
  
    test('should throw a validation error if password does not contain letters', async () => {
        user.password = '11111111';
        await expect(new User(user).validate()).rejects.toThrow();
    });
  
    test('should throw a validation error if role is unknown', async () => {
        user.role = 'invalid';
        await expect(new User(user).validate()).rejects.toThrow();
    });
});