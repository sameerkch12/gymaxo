import { z } from "zod";

export const adminLoginSchema = z.object({
  phone: z.string().min(6).max(30).trim(),
  password: z.string().min(8).max(100),
});

export const adminSubscriptionSchema = z.object({
  active: z.boolean(),
  days: z.number().int().positive().max(365).optional(),
});
