import { AppError } from "../errors/AppError.js";
import { EmailOtpModel } from "../models/email-otp.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/tokens.js";
import { toPublicUser, UserModel } from "../models/user.model.js";
import { OWNER_FREE_TRIAL_DAYS, type AccountRole, type Role } from "../constants/domain.js";
import { sendOtpEmail } from "./email.service.js";
import { createOwnerSubscription } from "./subscription.service.js";
import { linkCustomerMembershipToUser } from "./customer.service.js";
import { normalizePhone, phoneSearchValues } from "../utils/phone.js";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashOtp(code: string) {
  return hashPassword(code);
}

export async function signup(input: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: Role;
}) {
  const phone = normalizePhone(input.phone);
  const existing = await UserModel.exists({ phone: { $in: phoneSearchValues(input.phone) }, role: input.role });
  if (existing) throw new AppError(409, "Account already exists", "ACCOUNT_EXISTS");

  const user = await UserModel.create({
    name: input.name,
    phone,
    email: input.email,
    role: input.role,
    passwordHash: await hashPassword(input.password),
  });

  const subscription =
    input.role === "owner" ? await createOwnerSubscription(String(user._id), OWNER_FREE_TRIAL_DAYS) : null;
  if (input.role === "customer") {
    await linkCustomerMembershipToUser(String(user._id), phone);
  }
  const token = signAccessToken({ sub: String(user._id), role: input.role });
  return { token, user: toPublicUser({ ...user.toObject(), subscription }) };
}

export async function requestEmailOtp(input: { email: string; role: AccountRole }) {
  const existing = await UserModel.exists({ email: input.email, role: input.role });
  if (existing) throw new AppError(409, "Account already exists. Please login.", "ACCOUNT_EXISTS");

  const code = generateOtp();
  await EmailOtpModel.updateMany(
    { email: input.email, role: input.role, consumed: false },
    { consumed: true },
  );
  await EmailOtpModel.create({
    email: input.email,
    role: input.role,
    codeHash: await hashOtp(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  await sendOtpEmail(input.email, code);
  return { sent: true };
}

export async function verifyEmailOtp(input: {
  email: string;
  code: string;
  role: AccountRole;
  name: string;
  phone: string;
  password: string;
}) {
  const otp = await EmailOtpModel.findOne({
    email: input.email,
    role: input.role,
    consumed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otp) throw new AppError(400, "OTP expired or not found", "OTP_NOT_FOUND");
  if (otp.attempts >= 5) throw new AppError(429, "Too many OTP attempts", "OTP_TOO_MANY_ATTEMPTS");

  const ok = await verifyPassword(input.code, otp.codeHash);
  if (!ok) {
    otp.attempts += 1;
    await otp.save();
    throw new AppError(401, "Invalid OTP", "INVALID_OTP");
  }

  otp.consumed = true;
  await otp.save();

  const existingEmail = await UserModel.exists({ email: input.email, role: input.role });
  if (existingEmail) {
    throw new AppError(409, "Account already exists. Please login.", "ACCOUNT_EXISTS");
  }

  const phone = normalizePhone(input.phone);
  const existingPhone = await UserModel.exists({ phone: { $in: phoneSearchValues(input.phone) }, role: input.role });
  if (existingPhone) {
    throw new AppError(409, "Phone already registered for this role", "PHONE_EXISTS");
  }

  const user = await UserModel.create({
    name: input.name,
    phone,
    email: input.email,
    role: input.role,
    passwordHash: await hashPassword(input.password),
  });

  const subscription =
    input.role === "owner" ? await createOwnerSubscription(String(user._id), OWNER_FREE_TRIAL_DAYS) : null;
  if (input.role === "customer") {
    await linkCustomerMembershipToUser(String(user._id), phone);
  }
  const token = signAccessToken({ sub: String(user._id), role: input.role });
  return { token, user: toPublicUser({ ...user.toObject(), subscription }) };
}

export async function login(input: { identifier: string; password: string; role: Role }) {
  const identifier = input.identifier.trim().toLowerCase();
  const phoneValues = phoneSearchValues(input.identifier);
  const user = await UserModel.findOne({
    role: input.role,
    $or: [{ phone: { $in: phoneValues } }, { email: identifier }],
  }).select("+passwordHash");
  if (!user) throw new AppError(401, "Invalid phone, password or role", "INVALID_CREDENTIALS");

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new AppError(401, "Invalid phone, password or role", "INVALID_CREDENTIALS");

  const subscription =
    input.role === "owner" ? await SubscriptionModel.findOne({ ownerId: user._id }) : null;
  if (input.role === "customer") {
    await linkCustomerMembershipToUser(String(user._id), user.phone);
  }
  const token = signAccessToken({ sub: String(user._id), role: input.role });
  return { token, user: toPublicUser({ ...user.toObject(), subscription }) };
}

export async function getMe(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
  const subscription =
    user.role === "owner" ? await SubscriptionModel.findOne({ ownerId: user._id }) : null;
  return toPublicUser({ ...user.toObject(), subscription });
}
