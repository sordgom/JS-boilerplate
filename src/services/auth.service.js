const httpStatus = require("http-status");
const { ApiError } = require("../utils/error");
const { getUserByEmail } = require("./user.service");

const emailLogin = async (email, password) => {
    const user = await getUserByEmail(email);
    if(!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
    }
    return user;
};

// I need to start working on the token service
const logout = async (refreshToken) => {

};

const verifyEmail = async (token) => {
};

const refreshToken = async (refreshToken) => { 

};

const resetPassword = async (token, password) => {

};

module.exports = {
    emailLogin,
    logout,
    refreshToken,
    resetPassword,
    verifyEmail
};