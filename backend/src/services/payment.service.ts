import { AppError, notFound } from "../errors/AppError.js";
import type { PaymentStatus } from "../constants/domain.js";
import { MembershipPlanModel } from "../models/membership-plan.model.js";
import { PaymentRequestModel } from "../models/payment-request.model.js";
import { addDays, startOfToday } from "../utils/dates.js";
import { assertCustomerAccessibleByUser } from "./customer.service.js";
import { assertOwnerOwnsCustomer } from "./gym.service.js";

export async function submitPayment(
  userId: string,
  input: {
    customerId: string;
    planId: string;
    amount: number;
    screenshotUri?: string;
    utrNumber: string;
    note?: string;
  },
) {
  const customer = await assertCustomerAccessibleByUser(userId, input.customerId);

  const plan = await MembershipPlanModel.findOne({ _id: input.planId, ownerId: customer.ownerId });
  if (!plan) throw notFound("Plan not found");

  return PaymentRequestModel.create({
    customerId: customer._id,
    ownerId: customer.ownerId,
    planId: plan._id,
    amount: input.amount,
    screenshotUri: input.screenshotUri,
    utrNumber: input.utrNumber,
    note: input.note,
    status: "pending",
  });
}

export async function listOwnerPayments(ownerId: string, status?: PaymentStatus) {
  return PaymentRequestModel.find({ ownerId, ...(status ? { status } : {}) })
    .populate("customerId")
    .populate("planId")
    .sort({ createdAt: -1 });
}

export async function reviewPayment(ownerId: string, paymentId: string, status: Exclude<PaymentStatus, "pending">) {
  const payment = await PaymentRequestModel.findOne({ _id: paymentId, ownerId });
  if (!payment) throw notFound("Payment not found");
  if (payment.status !== "pending") throw new AppError(400, "Payment already reviewed", "ALREADY_REVIEWED");

  payment.status = status;
  payment.reviewedAt = new Date();
  await payment.save();

  if (status === "approved") {
    const customer = await assertOwnerOwnsCustomer(ownerId, String(payment.customerId));
    const plan = await MembershipPlanModel.findById(payment.planId);
    if (!plan) throw notFound("Plan not found");

    const today = startOfToday();
    const base = customer.endDate > today ? customer.endDate : today;
    customer.planId = plan._id;
    customer.endDate = addDays(base, plan.durationDays);
    customer.active = true;
    await customer.save();
  }

  return payment;
}
