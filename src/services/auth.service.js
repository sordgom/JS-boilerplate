const httpStatus = require("http-status");
const { ApiError } = require("../utils/error");
const userService = require("./user.service");
const tokenService = require("./token.service");
const { tokenTypes } = require("../models/tokenTypes");
const Token = require("../models/token.model");

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const emailLogin = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const tokenDoc = await tokenService.verifyToken({ token: refreshToken, tokenType: tokenTypes.REFRESH });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await tokenDoc.remove();
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (token) => {
  try {
    const tokenDoc = await tokenService.verifyToken({ token, tokenType: tokenTypes.VERIFY_EMAIL });
    const user = await userService.getUserById(tokenDoc.user);
    if (!user) {
      throw new Error();
    }
    // Delete all email verification attempts
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email verification failed");
  }
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const tokenDoc = await tokenService.verifyToken({ token: refreshToken, tokenType: tokenTypes.REFRESH });
    const user = await userService.getUserById(tokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await tokenDoc.remove();
    return await tokenService.generateAuthToken(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please login");
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (token, newPassword) => {
  try {
    const tokenDoc = await tokenService.verifyToken({ token, tokenType: tokenTypes.RESET_PASSWORD });
    const user = await userService.getUserById(tokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed.");
  }
};

module.exports = {
  emailLogin,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
