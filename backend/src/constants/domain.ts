export const ROLES = ["owner", "customer", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ACCOUNT_ROLES = ["owner", "customer"] as const;
export type AccountRole = (typeof ACCOUNT_ROLES)[number];

export const PLAN_TYPES = ["monthly", "quarterly", "yearly"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];

export const PAYMENT_STATUSES = ["pending", "approved", "rejected"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PLAN_DAYS: Record<PlanType, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

export const OWNER_MONTHLY_FEE = 99;
export const OWNER_FREE_TRIAL_DAYS = 100;
