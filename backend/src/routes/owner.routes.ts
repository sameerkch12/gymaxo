import { Router } from "express";
import * as ownerController from "../controllers/owner.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireActiveOwnerSubscription } from "../middleware/subscription.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  createBranchSchema,
  createCustomerSchema,
  createGymSchema,
  createPlanSchema,
  paymentSettingsSchema,
  idParamsSchema,
} from "../validators/gym.validator.js";
import { reviewPaymentSchema } from "../validators/payment.validator.js";

export const ownerRoutes = Router();

ownerRoutes.use(requireAuth, requireRole("owner"));

ownerRoutes.get("/dashboard", ownerController.dashboard);
ownerRoutes.get("/branches/:id/qr", validateParams(idParamsSchema), ownerController.branchQr);
ownerRoutes.post("/gyms", requireActiveOwnerSubscription, validateBody(createGymSchema), ownerController.createGym);
ownerRoutes.post("/branches", requireActiveOwnerSubscription, validateBody(createBranchSchema), ownerController.createBranch);
ownerRoutes.post("/plans", requireActiveOwnerSubscription, validateBody(createPlanSchema), ownerController.createPlan);
ownerRoutes.delete("/plans/:id", requireActiveOwnerSubscription, validateParams(idParamsSchema), ownerController.deletePlan);
ownerRoutes.post("/customers", requireActiveOwnerSubscription, validateBody(createCustomerSchema), ownerController.createCustomer);
ownerRoutes.patch("/payment-settings", validateBody(paymentSettingsSchema), ownerController.updatePaymentSettings);
ownerRoutes.get("/payments", ownerController.listPayments);
ownerRoutes.patch(
  "/payments/:id/review",
  requireActiveOwnerSubscription,
  validateParams(idParamsSchema),
  validateBody(reviewPaymentSchema),
  ownerController.reviewPayment,
);
ownerRoutes.post("/subscription/renew", ownerController.renewSubscription);
