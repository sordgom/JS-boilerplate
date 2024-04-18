const express = require("express");
const userRouter = require("./user.router");
const authRouter = require("./auth.router");

const router = express.Router();

const healthCheck = async (req, res) => {
  res.status(200).send(`The server is working properly!`);
};

// User routes
router.use("/users", userRouter);
router.use("/auth", authRouter);

// Server health check
router.use("/hc", healthCheck);

module.exports = router;
