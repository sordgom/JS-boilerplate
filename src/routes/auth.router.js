const express = require("express");
const authController = require("../controller/auth.controller");
const validate = require("../middleware/validate");
const authValidation = require("../validations/auth.validation");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", validate(authValidation.register), authController.register);
router.post("/login", validate(authValidation.login), authController.login);
router.post("/logout", validate(authValidation.logout), authController.logout);
router.post("/refresh-tokens", validate(authValidation.refreshTokens), authController.refreshTokens);
router.post("/forgot-password", validate(authValidation.forgotPassword), authController.forgotPassword);
router.post("/reset-password", validate(authValidation.resetPassword), authController.resetPassword);
router.post("/verify-email", validate(authValidation.verifyEmail), authController.verifyEmail);
router.post("/send-verification-email", auth(), authController.sendVerificationEmail);

module.exports = router;
