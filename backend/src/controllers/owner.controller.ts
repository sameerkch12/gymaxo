import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import * as gymService from "../services/gym.service.js";
import * as paymentService from "../services/payment.service.js";
import * as subscriptionService from "../services/subscription.service.js";

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await gymService.getOwnerData(req.auth!.userId);
  const payments = await paymentService.listOwnerPayments(req.auth!.userId);
  const subscription = await subscriptionService.getOwnerSubscription(req.auth!.userId);
  const paymentSettings = await gymService.getOwnerPaymentSettings(req.auth!.userId);
  res.json({ ok: true, data: { ...data, payments, subscription, paymentSettings } });
});

export const createGym = asyncHandler(async (req: Request, res: Response) => {
  const result = await gymService.createGym(req.auth!.userId, req.body);
  res.status(201).json({ ok: true, data: result });
});

export const createBranch = asyncHandler(async (req: Request, res: Response) => {
  const branch = await gymService.createBranch(req.auth!.userId, req.body);
  res.status(201).json({ ok: true, data: { branch } });
});

export const branchQr = asyncHandler(async (req: Request, res: Response) => {
  const qrPayload = await gymService.getBranchQrPayload(req.auth!.userId, req.params.id);
  res.json({ ok: true, data: { qrPayload } });
});

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await gymService.createPlan(req.auth!.userId, req.body);
  res.status(201).json({ ok: true, data: { plan } });
});

export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
  const result = await gymService.deletePlan(req.auth!.userId, req.params.id);
  res.json({ ok: true, data: result });
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await gymService.createCustomer(req.auth!.userId, req.body);
  res.status(201).json({ ok: true, data: { customer } });
});

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const payments = await paymentService.listOwnerPayments(req.auth!.userId, status as never);
  res.json({ ok: true, data: { payments } });
});

export const reviewPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.reviewPayment(req.auth!.userId, req.params.id, req.body.status);
  res.json({ ok: true, data: { payment } });
});

export const renewSubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await subscriptionService.renewOwnerSubscription(req.auth!.userId);
  res.json({ ok: true, data: { subscription } });
});

export const updatePaymentSettings = asyncHandler(async (req: Request, res: Response) => {
  const paymentSettings = await gymService.updatePaymentSettings(req.auth!.userId, req.body);
  res.json({ ok: true, data: { paymentSettings } });
});
