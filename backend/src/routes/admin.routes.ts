import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { idParamsSchema } from "../validators/gym.validator.js";
import { adminLoginSchema, adminSubscriptionSchema } from "../validators/admin.validator.js";

export const adminRoutes = Router();

adminRoutes.post("/login", validateBody(adminLoginSchema), adminController.login);
adminRoutes.use(requireAuth, requireRole("admin"));
adminRoutes.get("/me", adminController.me);
adminRoutes.get("/dashboard", adminController.dashboard);
adminRoutes.patch(
  "/owners/:id/subscription",
  validateParams(idParamsSchema),
  validateBody(adminSubscriptionSchema),
  adminController.updateOwnerSubscription,
);
