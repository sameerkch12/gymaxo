import { z } from "zod";
import { ACCOUNT_ROLES } from "../constants/domain.js";

export const loginSchema = z.object({
  identifier: z.string().min(3).max(100).trim(),
  password: z.string().min(6).max(100),
  role: z.enum(ACCOUNT_ROLES),
});

export const signupSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  phone: z.string().min(6).max(20).trim(),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100),
  role: z.enum(ACCOUNT_ROLES),
});

export const requestEmailOtpSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  role: z.enum(ACCOUNT_ROLES),
});

export const verifyEmailOtpSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  role: z.enum(ACCOUNT_ROLES),
  name: z.string().min(2).max(80).trim(),
  phone: z.string().min(6).max(20).trim(),
  password: z.string().min(6).max(100),
});
