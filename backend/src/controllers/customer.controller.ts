import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getMe } from "../services/auth.service.js";
import * as attendanceService from "../services/attendance.service.js";
import * as customerService from "../services/customer.service.js";
import * as paymentService from "../services/payment.service.js";
import { getOwnerSubscription } from "../services/subscription.service.js";
import { getOwnerPaymentSettings } from "../services/gym.service.js";
import { MembershipPlanModel } from "../models/membership-plan.model.js";

export const myMembership = asyncHandler(async (req: Request, res: Response) => {
  const user = await getMe(req.auth!.userId);
  const membership = await customerService.getMyMembership(req.auth!.userId, user.phone);
  const plans = membership
    ? await MembershipPlanModel.find({ ownerId: membership.ownerId }).sort({ createdAt: -1 })
    : [];
  res.json({ ok: true, data: { membership, plans } });
});

export const myHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await customerService.getCustomerHistory(req.auth!.userId, req.params.customerId);
  res.json({ ok: true, data: history });
});

export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const attendance = await attendanceService.markAttendance({
    userId: req.auth!.userId,
    ...req.body,
  });
  res.status(201).json({ ok: true, data: { attendance } });
});

export const submitPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.submitPayment(req.auth!.userId, req.body);
  res.status(201).json({ ok: true, data: { payment } });
});

export const ownerSubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await getOwnerSubscription(req.params.id);
  res.json({ ok: true, data: { subscription } });
});

export const ownerPaymentSettings = asyncHandler(async (req: Request, res: Response) => {
  const paymentSettings = await getOwnerPaymentSettings(req.params.id);
  res.json({ ok: true, data: { paymentSettings } });
});
