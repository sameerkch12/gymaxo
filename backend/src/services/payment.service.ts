import { AppError, notFound } from "../errors/AppError.js";
import { env } from "../config/env.js";
import type { PaymentStatus } from "../constants/domain.js";
import { MembershipPlanModel } from "../models/membership-plan.model.js";
import { PaymentRequestModel } from "../models/payment-request.model.js";
import { addDays, startOfToday } from "../utils/dates.js";
import { assertCustomerAccessibleByUser } from "./customer.service.js";
import { assertOwnerOwnsCustomer } from "./gym.service.js";
import { getEventService } from "./event.service.js";
import { notificationService } from "./notification.service.js";

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

  const payment = await PaymentRequestModel.create({
    customerId: customer._id,
    ownerId: customer.ownerId,
    planId: plan._id,
    amount: input.amount,
    screenshotUri: input.screenshotUri,
    utrNumber: input.utrNumber,
    note: input.note,
    status: "pending",
  });

  const eventService = getEventService();
  eventService.emitToOwner(String(customer.ownerId), "payment:submitted", {
    payment,
    paymentId: payment._id,
    customer,
    plan,
    amount: input.amount,
  });

  await notificationService.createNotification(
    String(customer.ownerId),
    "New Payment Submitted",
    `${customer.name} submitted a payment of Rs. ${input.amount} for ${plan.name}.`,
  );

  return payment;
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

  const eventService = getEventService();

  if (status === "approved") {
    const customer = await assertOwnerOwnsCustomer(ownerId, String(payment.customerId));
    const plan = await MembershipPlanModel.findById(payment.planId);
    if (!plan) throw notFound("Plan not found");

    const today = startOfToday(env.APP_TIME_ZONE);
    const base = customer.endDate > today ? customer.endDate : today;
    customer.planId = plan._id;
    customer.endDate = addDays(base, plan.durationDays);
    customer.active = true;
    await customer.save();

    const payload = {
      paymentId: payment._id,
      status,
      customer,
      payment,
    };

    eventService.emitToCustomer(String(customer._id), "payment:status_changed", payload);
    if (customer.userId) {
      await notificationService.createNotification(
        String(customer.userId),
        "Payment Approved",
        `Your payment for ${plan.name} has been approved. Membership extended until ${customer.endDate.toDateString()}.`,
      );
    }
  } else if (status === "rejected") {
    const customer = await assertOwnerOwnsCustomer(ownerId, String(payment.customerId));

    const payload = {
      paymentId: payment._id,
      status,
      customer,
      payment,
    };

    eventService.emitToCustomer(String(customer._id), "payment:status_changed", payload);
    if (customer.userId) {
      await notificationService.createNotification(
        String(customer.userId),
        "Payment Rejected",
        "Your payment submission has been rejected. Please check and resubmit.",
      );
    }
  }

  eventService.emitToOwner(ownerId, "payment:updated", {
    payment,
    paymentId: payment._id,
    status,
  });

  return payment;
}
