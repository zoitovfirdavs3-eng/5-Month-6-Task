const { Router } = require("express");
const authController = require("../controller/auth.controller");

const authRouter = Router();

authRouter.post("/register", authController.REGISTER);
authRouter.post("/resend/activation", authController.RESEND_ACTIVATION);
authRouter.post("/forgot/password", authController.FORGOT_PASSWORD);
authRouter.patch("/change-password", authController.CHANGE_PASSWORD);
authRouter.post("/login", authController.LOGIN);

authRouter.get("/activate", authController.ACTIVATE);

authRouter.post("/refresh", authController.REFRESH);

module.exports = authRouter;
