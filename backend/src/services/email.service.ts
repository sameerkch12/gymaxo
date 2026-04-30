import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export async function sendOtpEmail(email: string, code: string) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn(`[OTP DEV MODE] ${email}: ${code}`);
    return;
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
    subject: "Your Gymaxo login OTP",
    text: `Your Gymaxo OTP is ${code}. It expires in 10 minutes.`,
    html: `<p>Your Gymaxo OTP is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });
}
