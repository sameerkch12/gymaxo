import { SubscriptionModel } from "../models/subscription.model.js";
import { addDays, startOfToday } from "../utils/dates.js";
import { OWNER_MONTHLY_FEE } from "../constants/domain.js";
import { getEventService } from "./event.service.js";
import { notificationService } from "./notification.service.js";

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

  const subscription = await SubscriptionModel.findOneAndUpdate(
    { ownerId },
    {
      active: true,
      dueDate: addDays(base, 30),
      monthlyFee: existing?.monthlyFee ?? OWNER_MONTHLY_FEE,
      lastPaidAt: new Date(),
    },
    { new: true, upsert: true },
  );

  // Emit to owner
  const eventService = getEventService();
  eventService.emitToOwner(ownerId, "subscription:renewed", {
    subscription,
  });

  // Notify owner
  await notificationService.createNotification(
    ownerId,
    "Subscription Renewed",
    `Your subscription has been renewed. Valid until ${subscription.dueDate.toDateString()}.`
  );

  return subscription;
}

export async function setOwnerSubscriptionStatus(ownerId: string, active: boolean, days = 30) {
  const existing = await SubscriptionModel.findOne({ ownerId });
  const today = startOfToday();
  const base = existing && existing.dueDate > today ? existing.dueDate : today;

  const subscription = await SubscriptionModel.findOneAndUpdate(
    { ownerId },
    {
      active,
      dueDate: active ? addDays(base, days) : today,
      monthlyFee: existing?.monthlyFee ?? OWNER_MONTHLY_FEE,
      lastPaidAt: active ? new Date() : existing?.lastPaidAt,
    },
    { new: true, upsert: true },
  );

  // Emit to owner
  const eventService = getEventService();
  eventService.emitToOwner(ownerId, "subscription:status_changed", {
    subscription,
  });

  // Notify owner
  const statusText = active ? "activated" : "deactivated";
  await notificationService.createNotification(
    ownerId,
    `Subscription ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
    `Your subscription has been ${statusText}${active ? ` until ${subscription.dueDate.toDateString()}` : ""}.`
  );

  // Emit to admin for update
  eventService.emitToAdmin("owner:subscription_updated", {
    ownerId,
    subscription,
  });

  return subscription;
}

export function isSubscriptionExpired(subscription?: { active?: boolean; dueDate: Date } | null) {
  if (!subscription || !subscription.active) return true;
  return subscription.dueDate < startOfToday();
}
