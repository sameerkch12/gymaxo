import { env } from "../config/env.js";
import { unauthorized } from "../errors/AppError.js";
import { AttendanceModel } from "../models/attendance.model.js";
import { BranchModel } from "../models/branch.model.js";
import { CustomerModel } from "../models/customer.model.js";
import { GymModel } from "../models/gym.model.js";
import { MembershipPlanModel } from "../models/membership-plan.model.js";
import { PaymentRequestModel } from "../models/payment-request.model.js";
import { SubscriptionModel } from "../models/subscription.model.js";
import { toPublicUser, UserModel } from "../models/user.model.js";
import { setOwnerSubscriptionStatus } from "./subscription.service.js";
import { signAccessToken } from "../utils/tokens.js";

export function getAdminUser() {
  return {
    id: "platform-admin",
    name: env.ADMIN_NAME,
    phone: env.ADMIN_PHONE,
    email: null,
    role: "admin" as const,
    createdAt: null,
  };
}

export async function loginAdmin(input: { phone: string; password: string }) {
  if (input.phone !== env.ADMIN_PHONE || input.password !== env.ADMIN_PASSWORD) {
    throw unauthorized("Invalid admin credentials");
  }

  const user = getAdminUser();
  const token = signAccessToken({ sub: user.id, role: "admin" });
  return { token, user };
}

function publicBranch(branch: { toObject(): Record<string, unknown> }) {
  const raw = branch.toObject();
  const { qrSecret: _qrSecret, ...safe } = raw;
  return safe;
}

export async function getPlatformDashboard() {
  const [owners, customersUsers, subscriptions, gyms, branches, plans, customers, attendance, payments] =
    await Promise.all([
      UserModel.find({ role: "owner" }).sort({ createdAt: -1 }),
      UserModel.find({ role: "customer" }).sort({ createdAt: -1 }),
      SubscriptionModel.find().sort({ dueDate: 1 }),
      GymModel.find().sort({ createdAt: -1 }),
      BranchModel.find().sort({ createdAt: -1 }),
      MembershipPlanModel.find().sort({ createdAt: -1 }),
      CustomerModel.find().sort({ createdAt: -1 }),
      AttendanceModel.find().sort({ timestamp: -1 }).limit(1000),
      PaymentRequestModel.find().sort({ createdAt: -1 }).limit(1000),
    ]);

  return {
    owners: owners.map((owner) => toPublicUser(owner.toObject())),
    customerUsers: customersUsers.map((customer) => toPublicUser(customer.toObject())),
    subscriptions,
    gyms,
    branches: branches.map(publicBranch),
    plans,
    customers,
    attendance,
    payments,
  };
}

export async function updateOwnerSubscription(ownerId: string, input: { active: boolean; days?: number }) {
  const owner = await UserModel.findOne({ _id: ownerId, role: "owner" });
  if (!owner) {
    throw unauthorized("Owner not found");
  }

  return setOwnerSubscriptionStatus(ownerId, input.active, input.days ?? 30);
}
