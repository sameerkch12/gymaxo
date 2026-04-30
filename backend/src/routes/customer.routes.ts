import { Router } from "express";
import * as customerController from "../controllers/customer.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { markAttendanceSchema } from "../validators/attendance.validator.js";
import { idParamsSchema } from "../validators/gym.validator.js";
import { submitPaymentSchema } from "../validators/payment.validator.js";

export const customerRoutes = Router();

customerRoutes.use(requireAuth, requireRole("customer"));

customerRoutes.get("/membership", customerController.myMembership);
customerRoutes.get(
  "/owner-subscription/:id",
  validateParams(idParamsSchema),
  customerController.ownerSubscription,
);
customerRoutes.get(
  "/owner-payment-settings/:id",
  validateParams(idParamsSchema),
  customerController.ownerPaymentSettings,
);
customerRoutes.get(
  "/customers/:id/history",
  validateParams(idParamsSchema),
  (req, _res, next) => {
    req.params.customerId = req.params.id;
    next();
  },
  customerController.myHistory,
);
customerRoutes.post("/attendance", validateBody(markAttendanceSchema), customerController.markAttendance);
customerRoutes.post("/payments", validateBody(submitPaymentSchema), customerController.submitPayment);
