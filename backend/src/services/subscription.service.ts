import { SubscriptionModel } from "../models/subscription.model.js";
import { addDays, startOfToday } from "../utils/dates.js";
import { OWNER_MONTHLY_FEE } from "../constants/domain.js";

export async function createOwnerSubscription(ownerId: string, daysUntilDue = 30) {
  return SubscriptionModel.create({
    ownerId,
    active: true,
    dueDate: addDays(startOfToday(), daysUntilDue),
    monthlyFee: OWNER_MONTHLY_FEE,
    lastPaidAt: new Date(),
  });
}

export async function getOwnerSubscription(ownerId: string) {
  return SubscriptionModel.findOne({ ownerId });
}

export async function renewOwnerSubscription(ownerId: string) {
  const existing = await SubscriptionModel.findOne({ ownerId });
  const today = startOfToday();
  const base = existing && existing.dueDate > today ? existing.dueDate : today;

  return SubscriptionModel.findOneAndUpdate(
    { ownerId },
    {
      active: true,
      dueDate: addDays(base, 30),
      monthlyFee: existing?.monthlyFee ?? OWNER_MONTHLY_FEE,
      lastPaidAt: new Date(),
    },
    { new: true, upsert: true },
  );
}

export async function setOwnerSubscriptionStatus(ownerId: string, active: boolean, days = 30) {
  const existing = await SubscriptionModel.findOne({ ownerId });
  const today = startOfToday();
  const base = existing && existing.dueDate > today ? existing.dueDate : today;

  return SubscriptionModel.findOneAndUpdate(
    { ownerId },
    {
      active,
      dueDate: active ? addDays(base, days) : today,
      monthlyFee: existing?.monthlyFee ?? OWNER_MONTHLY_FEE,
      lastPaidAt: active ? new Date() : existing?.lastPaidAt,
    },
    { new: true, upsert: true },
  );
}

export function isSubscriptionExpired(subscription?: { active?: boolean; dueDate: Date } | null) {
  if (!subscription || !subscription.active) return true;
  return subscription.dueDate < startOfToday();
}
