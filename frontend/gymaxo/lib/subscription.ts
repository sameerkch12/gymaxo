import { OWNER_MONTHLY_FEE, Subscription, User } from "./types";

export function todayISO(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO).getTime();
  const b = new Date(toISO).getTime();
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
}

export function newSubscription(daysUntilDue = 30): Subscription {
  return {
    active: true,
    dueDate: addDaysISO(todayISO(), daysUntilDue),
    monthlyFee: OWNER_MONTHLY_FEE,
    lastPaidAt: new Date().toISOString(),
  };
}

export function ensureSubscription(user: User): Subscription {
  return user.subscription ?? newSubscription(30);
}

export function isSubscriptionExpired(sub?: Subscription | null): boolean {
  if (!sub || !sub.active) return true;
  return sub.dueDate < todayISO();
}

export function daysUntilDue(sub?: Subscription | null): number {
  if (!sub || !sub.active) return 0;
  return daysBetween(todayISO(), sub.dueDate);
}

export function renewedSubscription(prev?: Subscription | null): Subscription {
  const today = todayISO();
  const base = prev && prev.dueDate > today ? prev.dueDate : today;
  return {
    active: true,
    dueDate: addDaysISO(base, 30),
    monthlyFee: OWNER_MONTHLY_FEE,
    lastPaidAt: new Date().toISOString(),
  };
}
