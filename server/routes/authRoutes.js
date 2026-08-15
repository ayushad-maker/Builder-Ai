import { Router } from "express";

import { login, logout, me, register } from "../controllers/authControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/logout", logout);
authRouter.post("/login", login);
authRouter.get("/me", authMiddleware, me);

export default authRouter;
