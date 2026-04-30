import { nanoid } from "nanoid";
import { forbidden, notFound } from "../errors/AppError.js";
import { PLAN_DAYS, type PlanType } from "../constants/domain.js";
import { BranchModel } from "../models/branch.model.js";
import { AttendanceModel } from "../models/attendance.model.js";
import { CustomerModel } from "../models/customer.model.js";
import { GymModel } from "../models/gym.model.js";
import { MembershipPlanModel } from "../models/membership-plan.model.js";
import { UserModel } from "../models/user.model.js";
import { addDays } from "../utils/dates.js";
import { normalizePhone } from "../utils/phone.js";

function toPublicBranch(branch: { toObject(): Record<string, unknown> } | Record<string, unknown>) {
  const raw: Record<string, unknown> =
    typeof (branch as { toObject?: unknown }).toObject === "function"
      ? (branch as { toObject(): Record<string, unknown> }).toObject()
      : branch;
  const { qrSecret: _qrSecret, ...publicBranch } = raw;
  return publicBranch;
}

export async function getOwnerData(ownerId: string) {
  const [gyms, branches, plans, customers] = await Promise.all([
    GymModel.find({ ownerId }).sort({ createdAt: -1 }),
    BranchModel.find({ ownerId }).sort({ createdAt: -1 }),
    MembershipPlanModel.find({ ownerId }).sort({ createdAt: -1 }),
    CustomerModel.find({ ownerId }).sort({ createdAt: -1 }),
  ]);
  const customerIds = customers.map((customer) => customer._id);
  const attendance = await AttendanceModel.find({ customerId: { $in: customerIds } }).sort({
    timestamp: -1,
  });
  return { gyms, branches: branches.map(toPublicBranch), plans, customers, attendance };
}

export async function createGym(ownerId: string, input: { name: string; address: string }) {
  const gym = await GymModel.create({ ownerId, ...input });
  const branch = await BranchModel.create({
    ownerId,
    gymId: gym._id,
    name: "Main Branch",
    address: input.address,
    qrSecret: nanoid(32),
  });

  return { gym, branch: toPublicBranch(branch) };
}

export async function createBranch(ownerId: string, input: { gymId: string; name: string; address: string }) {
  const gym = await GymModel.findOne({ _id: input.gymId, ownerId });
  if (!gym) throw notFound("Gym not found");

  const branch = await BranchModel.create({
    ownerId,
    gymId: input.gymId,
    name: input.name,
    address: input.address,
    qrSecret: nanoid(32),
  });
  return toPublicBranch(branch);
}

export async function getBranchQrPayload(ownerId: string, branchId: string) {
  const branch = await BranchModel.findOne({ _id: branchId, ownerId });
  if (!branch) throw notFound("Branch not found");

  return {
    type: "gympro_attendance",
    gymId: String(branch.gymId),
    branchId: String(branch._id),
    secret: branch.qrSecret,
  };
}

export async function createPlan(ownerId: string, input: { name: string; type: PlanType; price: number }) {
  return MembershipPlanModel.create({
    ownerId,
    name: input.name,
    type: input.type,
    price: input.price,
    durationDays: PLAN_DAYS[input.type],
  });
}

export async function deletePlan(ownerId: string, planId: string) {
  const plan = await MembershipPlanModel.findOne({ _id: planId, ownerId });
  if (!plan) throw notFound("Plan not found");

  await plan.deleteOne();
  return { id: planId };
}

export async function updatePaymentSettings(ownerId: string, input: { upiId: string }) {
  const owner = await UserModel.findOneAndUpdate(
    { _id: ownerId, role: "owner" },
    { paymentUpiId: input.upiId.trim() },
    { new: true },
  );
  if (!owner) throw notFound("Owner not found");
  return { upiId: owner.paymentUpiId ?? "" };
}

export async function getOwnerPaymentSettings(ownerId: string) {
  const owner = await UserModel.findOne({ _id: ownerId, role: "owner" });
  if (!owner) throw notFound("Owner not found");
  return { upiId: owner.paymentUpiId ?? "" };
}

export async function createCustomer(
  ownerId: string,
  input: {
    name: string;
    phone: string;
    gymId: string;
    branchId: string;
    planId: string;
    startDate: Date;
    userId?: string;
  },
) {
  const [gym, branch, plan] = await Promise.all([
    GymModel.findOne({ _id: input.gymId, ownerId }),
    BranchModel.findOne({ _id: input.branchId, ownerId, gymId: input.gymId }),
    MembershipPlanModel.findOne({ _id: input.planId, ownerId }),
  ]);

  if (!gym) throw notFound("Gym not found");
  if (!branch) throw notFound("Branch not found");
  if (!plan) throw notFound("Plan not found");

  return CustomerModel.create({
    ownerId,
    gymId: input.gymId,
    branchId: input.branchId,
    userId: input.userId,
    name: input.name,
    phone: normalizePhone(input.phone),
    planId: input.planId,
    startDate: input.startDate,
    endDate: addDays(input.startDate, plan.durationDays),
    active: true,
  });
}

export async function assertOwnerOwnsCustomer(ownerId: string, customerId: string) {
  const customer = await CustomerModel.findById(customerId);
  if (!customer) throw notFound("Customer not found");
  if (String(customer.ownerId) !== ownerId) throw forbidden();
  return customer;
}
