const express = require('express');

const userRouter = express.Router();

userRouter.get('/', () => {
    console.log(`It's working!`)
});

module.exports = userRouter;