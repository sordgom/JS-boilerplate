const express = require("express");
const userRouter = require("./user.router");

const router = express.Router();

const healthCheck = async (req, res) => {
  res.status(200).send(`The server is working properly!`);
};

router.use("/user", userRouter);
router.use("/hc", healthCheck);

module.exports = router;
