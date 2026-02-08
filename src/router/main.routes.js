const { Router } = require("express");
const authRouter = require("./auth.routes");
const authGuard = require("../guard/auth.guard");

const mainRouter = Router();

mainRouter.use("/auth", authRouter);

mainRouter.use(authGuard);

mainRouter.get("/data", (req, res) => res.send("Hello world"))

module.exports = mainRouter;