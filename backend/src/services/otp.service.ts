import nodemailer from "nodemailer";
import twilio from "twilio";
import { env } from "../config/env.js";

// In-memory store for dev mode OTPs (for demonstration)
export const devModeOtps: { [key: string]: string } = {};

interface OtpResponse {
  sent: true;
  devOtp?: string; // Only in development mode
}

/**
 * Send OTP via Email (Email-based OTP)
 */
export async function sendOtpEmail(email: string, code: string): Promise<OtpResponse> {
  if (env.NODE_ENV === "development") {
    console.log(`\n📧 [DEV MODE - EMAIL OTP] Email: ${email}`);
    console.log(`📧 [DEV MODE - EMAIL OTP] OTP: ${code}\n`);
    devModeOtps[`email_${email}`] = code;
    return { sent: true, devOtp: code };
  }

  // Production mode - send via SMTP
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error("SMTP configuration missing for production mode");
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    family: 4,
  } as any);

  await transporter.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: email,
    subject: "Your Gymaxo Login OTP",
    text: `Your Gymaxo OTP is ${code}. It expires in 10 minutes.`,
    html: `<p>Your Gymaxo OTP is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });

  return { sent: true };
}

/**
 * Send OTP via SMS (Phone-based OTP)
 */
export async function sendOtpSms(phone: string, code: string): Promise<OtpResponse> {
  if (env.NODE_ENV === "development") {
    console.log(`\n📱 [DEV MODE - SMS OTP] Phone: ${phone}`);
    console.log(`📱 [DEV MODE - SMS OTP] OTP: ${code}\n`);
    devModeOtps[`sms_${phone}`] = code;
    return { sent: true, devOtp: code };
  }

  // Production mode - send via Twilio
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
    throw new Error("Twilio configuration missing for production mode");
  }

  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: `Your Gymaxo OTP is ${code}. It expires in 10 minutes. Do not share this OTP with anyone.`,
    from: env.TWILIO_PHONE_NUMBER,
    to: phone,
  });

  return { sent: true };
}

/**
 * Get dev mode OTP for testing (development only)
 */
export function getDevModeOtp(key: string): string | undefined {
  return devModeOtps[key];
}

/**
 * Clear dev mode OTP (development only)
 */
export function clearDevModeOtp(key: string): void {
  delete devModeOtps[key];
}
