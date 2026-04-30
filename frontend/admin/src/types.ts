export type Role = "owner" | "customer" | "admin";
export type PlanType = "monthly" | "quarterly" | "yearly";
export type PaymentStatus = "pending" | "approved" | "rejected";

export interface Subscription {
  id?: string;
  ownerId?: string;
  active: boolean;
  dueDate: string;
  monthlyFee: number;
  lastPaidAt?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: Role;
  createdAt?: string;
  subscription?: Subscription | null;
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
  createdAt?: string;
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

export interface DashboardData {
  owners: User[];
  customerUsers: User[];
  subscriptions: Subscription[];
  gyms: Gym[];
  branches: Branch[];
  plans: MembershipPlan[];
  customers: Customer[];
  attendance: Attendance[];
  payments: PaymentRequest[];
  subscription: Subscription | null;
}
