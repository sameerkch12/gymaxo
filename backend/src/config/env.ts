import "dotenv/config";
import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off", ""].includes(normalized)) return false;
  }
  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "staging"]).default("development"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/gymaxo"),
  JWT_SECRET: z.string().min(24),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ADMIN_PHONE: z.string().min(6),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_NAME: z.string().default("Platform Admin"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: booleanFromEnv.default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:8081,http://localhost:19006"),
});

export const env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
