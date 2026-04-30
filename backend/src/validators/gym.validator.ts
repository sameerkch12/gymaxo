import { z } from "zod";
import { PLAN_TYPES } from "../constants/domain.js";

export const idParamsSchema = z.object({
  id: z.string().min(1),
});

export const createGymSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  address: z.string().min(2).max(200).trim(),
});

export const createBranchSchema = z.object({
  gymId: z.string().min(1),
  name: z.string().min(2).max(100).trim(),
  address: z.string().min(2).max(200).trim(),
});

export const createPlanSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  type: z.enum(PLAN_TYPES),
  price: z.number().int().positive(),
});

export const createCustomerSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  phone: z.string().min(6).max(20).trim(),
  gymId: z.string().min(1),
  branchId: z.string().min(1),
  planId: z.string().min(1),
  startDate: z.coerce.date(),
  userId: z.string().min(1).optional(),
});

export const paymentSettingsSchema = z.object({
  upiId: z.string().max(100).trim(),
});
