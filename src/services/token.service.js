const httpStatus = require("http-status");
const { ApiError } = require("../utils/error");
const Token = require("../models/token.model");
const tokenTypes = require("../models/tokenTypes");
const config = require("../config/config");
const { userService } = require(".");

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        iat: moment.unix(),
        exp: expires.unix(),
        type, 
    };
    return jwt.sign(payload, secret);
};

/**
 * Store token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {string} tokenType
 * @param {Moment} expires
 * @returns {Promise<Token>}
 */
const storeToken = async (token, userId, tokenType, expires) => {
    const newToken = await Token.create({
        token,
        user: userId,
        type: tokenType,
        expires
    });
    return newToken;
};

/**
 * Verify token and return token (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, tokenType) => {
    const payload = jwt.verify(token, config.jwt.secret);
    const token = await Token.findOne({token, user: payload.sub ,type: tokenType , expires: payload.exp});
    if(!token) {
        throw new Error("Token not found") //Used Error instead of APIError because this should be an internal error
    }
    return token;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthToken= async (user) => {
    let accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    let accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);
    
    let refreshTokenExpires = moment().add(config.jwt.refreshExpirationMinutes, 'minutes');
    let refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
    await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate()
        }
    }
};


/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
    const user = await userService.getUserByEmail(email);
    if(!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
    }
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
    await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
    return resetPasswordToken;
}

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
    const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
    const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
    await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
    return verifyEmailToken;
};

  module.exports = {
    generateToken,
    storeToken,
    verifyToken,
    generateAuthToken,
    generateResetPasswordToken,
    generateVerifyEmailToken
};