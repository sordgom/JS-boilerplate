const express = require("express");
const userController = require("../controller/user.controller");
const validate = require("../middleware/validate");
const userValidation = require("../validations/user.validation");
const auth = require("../middleware/auth");

const router = express.Router();
router
    .route("/")
    .post(auth("manageUsers"), validate(userValidation.createUser), userController.createUser)
    .get(auth("getUsers"), validate(userValidation.getUsers), userController.getUsers);

router
    .route("/:userId")
    .get(auth("getUsers"), validate(userValidation.getUser), userController.getUser)
    .patch(auth("manageUsers"), validate(userValidation.updateUser), userController.updateUser)
    .delete(auth("manageUsers"), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
