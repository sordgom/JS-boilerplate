const express = require("express");
const userRouter = require("./user.router");
const authRouter = require("./auth.router");
const docsRouter = require("./docs.router");
const config = require("../config/config");

const router = express.Router();

const healthCheck = async (req, res) => {
  res.status(200).send(`The server is working properly!`);
};

const defaultRouters = [
  {
    path: "/users",
    router: userRouter,
  },
  {
    path: "/auth",
    router: authRouter,
  },
  {
    path: "/hc",
    router: healthCheck,
  },
];

const devRouters = [
  {
    path: "/docs",
    router: docsRouter,
  },
];
const systemRouters = [];

defaultRouters.forEach((route) => {
  router.use(route.path, route.router);
});

systemRouters.forEach((route) => {
  router.use(route.path, route.router);
});

if (config.env === "development") {
  devRouters.forEach((route) => {
    router.use(route.path, route.router);
  });
}

module.exports = router;
