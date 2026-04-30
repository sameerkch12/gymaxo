export type Role = "owner" | "customer";

export type PlanType = "monthly" | "quarterly" | "yearly";

export type ThemePref = "system" | "light" | "dark";

export interface Subscription {
  active: boolean;
  dueDate: string;
  monthlyFee: number;
  lastPaidAt?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  password: string;
  createdAt: string;
  subscription?: Subscription;
  paymentUpiId?: string;
}

export interface Gym {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  gymId: string;
  ownerId: string;
  name: string;
  address: string;
  createdAt: string;
}

export interface MembershipPlan {
  id: string;
  ownerId: string;
  name: string;
  type: PlanType;
  durationDays: number;
  price: number;
}

export interface Customer {
  id: string;
  ownerId: string;
  gymId: string;
  branchId: string;
  userId?: string;
  name: string;
  phone: string;
  planId: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

export interface Attendance {
  id: string;
  customerId: string;
  gymId: string;
  branchId: string;
  date: string;
  time: string;
  timestamp: number;
}

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface PaymentRequest {
  id: string;
  customerId: string;
  ownerId: string;
  planId: string;
  amount: number;
  screenshotUri?: string;
  utrNumber: string;
  status: PaymentStatus;
  note?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Session {
  userId: string;
  role: Role;
}

export const PLAN_DAYS: Record<PlanType, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

export const OWNER_MONTHLY_FEE = 99;
