const express = require("express");
const userController = require("../controller/user.controller");

const router = express.Router();

router
    .route("/")
    .post(userController.createUser)
    .get(userController.getUsers);

router
    .route("/:userId")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
