import { Platform } from "react-native";

import { readJSON, STORAGE_KEYS, writeJSON } from "./storage";
import { Customer, User } from "./types";
import {
  daysUntilDue,
  isSubscriptionExpired,
  todayISO,
} from "./subscription";

export interface ReminderItem {
  id: string;
  scheduledFor: string;
  title: string;
  body: string;
}

const REMINDER_HOURS = [9, 14, 19] as const;

async function getNotificationsModule() {
  if (Platform.OS === "web") return null;
  try {
    const mod = await import("expo-notifications");
    return mod;
  } catch {
    return null;
  }
}

export async function configureNotifications(): Promise<void> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    const settings = await Notifications.getPermissionsAsync();
    if (!settings.granted) {
      await Notifications.requestPermissionsAsync();
    }
  } catch {
    // ignore
  }
}

async function cancelAllScheduled(): Promise<void> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}

interface ReminderTarget {
  /** date YYYY-MM-DD when fee/membership is due */
  dueDate: string;
  /** what we're reminding about */
  title: string;
  body: (daysLeft: number) => string;
}

function buildSchedule(
  targets: ReminderTarget[],
): { date: Date; title: string; body: string }[] {
  const out: { date: Date; title: string; body: string }[] = [];
  const now = new Date();
  for (const t of targets) {
    const due = new Date(t.dueDate);
    for (let offset = 3; offset >= 1; offset--) {
      const day = new Date(due);
      day.setDate(day.getDate() - offset);
      for (const hour of REMINDER_HOURS) {
        const at = new Date(day);
        at.setHours(hour, 0, 0, 0);
        if (at.getTime() > now.getTime() + 5_000) {
          out.push({
            date: at,
            title: t.title,
            body: t.body(offset),
          });
        }
      }
    }
  }
  return out;
}

export async function scheduleReminders(input: {
  user: User | null;
  myCustomer?: Customer | null;
}): Promise<void> {
  await cancelAllScheduled();

  if (!input.user) return;

  const Notifications = await getNotificationsModule();

  const targets: ReminderTarget[] = [];

  if (input.user.role === "owner" && input.user.subscription) {
    targets.push({
      dueDate: input.user.subscription.dueDate,
      title: "GymPro subscription due soon",
      body: (d) =>
        `Your ₹${input.user!.subscription!.monthlyFee} subscription is due in ${d} day${d !== 1 ? "s" : ""}. Pay now to keep your gym active.`,
    });
  }

  if (input.user.role === "customer" && input.myCustomer) {
    targets.push({
      dueDate: input.myCustomer.endDate,
      title: "Membership renewal coming up",
      body: (d) =>
        `Your gym membership expires in ${d} day${d !== 1 ? "s" : ""}. Submit a renewal payment to stay active.`,
    });
  }

  const schedule = buildSchedule(targets);

  await writeJSON<ReminderItem[]>(
    STORAGE_KEYS.scheduledNotifs,
    schedule.map((s, i) => ({
      id: `r_${i}`,
      scheduledFor: s.date.toISOString(),
      title: s.title,
      body: s.body,
    })),
  );

  if (!Notifications) return;

  for (const item of schedule) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: item.body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.date,
        },
      });
    } catch {
      // ignore individual failures
    }
  }
}

export async function getScheduledReminders(): Promise<ReminderItem[]> {
  return readJSON<ReminderItem[]>(STORAGE_KEYS.scheduledNotifs, []);
}

/** Returns the most relevant in-app banner for the current user, or null. */
export function computeBanner(input: {
  user: User | null;
  myCustomer?: Customer | null;
  ownerSubscription?: User["subscription"] | null;
}): {
  kind: "owner-fee" | "owner-fee-expired" | "membership" | "gym-locked";
  title: string;
  body: string;
  daysLeft: number;
} | null {
  if (!input.user) return null;

  if (input.user.role === "owner") {
    const sub = input.user.subscription;
    if (!sub) return null;
    const days = daysUntilDue(sub);
    if (isSubscriptionExpired(sub)) {
      return {
        kind: "owner-fee-expired",
        title: "Subscription expired",
        body: `Pay ₹${sub.monthlyFee} to reactivate your gym and members.`,
        daysLeft: days,
      };
    }
    if (days <= 3) {
      return {
        kind: "owner-fee",
        title: `Subscription due in ${days} day${days !== 1 ? "s" : ""}`,
        body: `Pay ₹${sub.monthlyFee} to avoid your gym being locked.`,
        daysLeft: days,
      };
    }
  }

  if (input.user.role === "customer") {
    if (input.ownerSubscription && isSubscriptionExpired(input.ownerSubscription)) {
      return {
        kind: "gym-locked",
        title: "Your gym's subscription expired",
        body: "Ask the owner to renew their GymPro plan to unlock check-in.",
        daysLeft: 0,
      };
    }
    if (input.myCustomer) {
      const today = todayISO();
      const days = Math.ceil(
        (new Date(input.myCustomer.endDate).getTime() -
          new Date(today).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (days >= 0 && days <= 3) {
        return {
          kind: "membership",
          title: `Membership ends in ${days} day${days !== 1 ? "s" : ""}`,
          body: "Submit a renewal payment to your gym to stay active.",
          daysLeft: days,
        };
      }
    }
  }

  return null;
}
