import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  loginSchema,
  requestEmailOtpSchema,
  signupSchema,
  verifyEmailOtpSchema,
} from "../validators/auth.validator.js";

export const authRoutes = Router();

authRoutes.post("/signup", validateBody(signupSchema), authController.signup);
authRoutes.post("/login", validateBody(loginSchema), authController.login);
authRoutes.post("/email-otp/request", validateBody(requestEmailOtpSchema), authController.requestEmailOtp);
authRoutes.post("/email-otp/verify", validateBody(verifyEmailOtpSchema), authController.verifyEmailOtp);
authRoutes.get("/me", requireAuth, authController.me);
