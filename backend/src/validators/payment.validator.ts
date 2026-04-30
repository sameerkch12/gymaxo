import { z } from "zod";

export const submitPaymentSchema = z.object({
  customerId: z.string().min(1),
  planId: z.string().min(1),
  amount: z.number().int().positive(),
  utrNumber: z.string().min(4).max(100).trim(),
  note: z.string().max(500).optional(),
});

export const reviewPaymentSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});
