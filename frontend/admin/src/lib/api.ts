import type {
  Attendance,
  Branch,
  Customer,
  DashboardData,
  Gym,
  MembershipPlan,
  PaymentRequest,
  Subscription,
  User,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "gymaxo-admin-token";

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  message?: string;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok || !payload.ok) {
    throw new Error(payload.message ?? "Request failed");
  }
  return payload.data as T;
}

function id(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record.id ?? record._id ?? "");
  }
  return String(value);
}

function date(value: unknown): string {
  if (!value) return "";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toISOString().slice(0, 10);
}

function dateTime(value: unknown): string {
  if (!value) return "";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toISOString();
}

export function normalizeSubscription(raw: unknown): Subscription | null {
  if (!raw || typeof raw !== "object") return null;
  const sub = raw as Record<string, unknown>;
  return {
    id: id(sub),
    ownerId: id(sub.ownerId),
    active: Boolean(sub.active),
    dueDate: date(sub.dueDate),
    monthlyFee: Number(sub.monthlyFee ?? 0),
    ...(sub.lastPaidAt ? { lastPaidAt: dateTime(sub.lastPaidAt) } : {}),
  };
}

export function normalizeUser(raw: unknown): User {
  const user = raw as Record<string, unknown>;
  return {
    id: id(user),
    name: String(user.name ?? ""),
    phone: String(user.phone ?? ""),
    email: user.email ? String(user.email) : null,
    role: user.role === "admin" ? "admin" : user.role === "customer" ? "customer" : "owner",
    createdAt: dateTime(user.createdAt),
    subscription: normalizeSubscription(user.subscription),
  };
}

function normalizeGym(raw: unknown): Gym {
  const gym = raw as Record<string, unknown>;
  return {
    id: id(gym),
    ownerId: id(gym.ownerId),
    name: String(gym.name ?? ""),
    address: String(gym.address ?? ""),
    createdAt: dateTime(gym.createdAt),
  };
}

function normalizeBranch(raw: unknown): Branch {
  const branch = raw as Record<string, unknown>;
  return {
    id: id(branch),
    ownerId: id(branch.ownerId),
    gymId: id(branch.gymId),
    name: String(branch.name ?? ""),
    address: String(branch.address ?? ""),
    createdAt: dateTime(branch.createdAt),
  };
}

function normalizePlan(raw: unknown): MembershipPlan {
  const plan = raw as Record<string, unknown>;
  return {
    id: id(plan),
    ownerId: id(plan.ownerId),
    name: String(plan.name ?? ""),
    type: plan.type === "yearly" ? "yearly" : plan.type === "quarterly" ? "quarterly" : "monthly",
    durationDays: Number(plan.durationDays ?? 0),
    price: Number(plan.price ?? 0),
    createdAt: dateTime(plan.createdAt),
  };
}

function normalizeCustomer(raw: unknown): Customer {
  const customer = raw as Record<string, unknown>;
  return {
    id: id(customer),
    ownerId: id(customer.ownerId),
    gymId: id(customer.gymId),
    branchId: id(customer.branchId),
    ...(customer.userId ? { userId: id(customer.userId) } : {}),
    name: String(customer.name ?? ""),
    phone: String(customer.phone ?? ""),
    planId: id(customer.planId),
    startDate: date(customer.startDate),
    endDate: date(customer.endDate),
    active: Boolean(customer.active),
    createdAt: dateTime(customer.createdAt),
  };
}

function normalizeAttendance(raw: unknown): Attendance {
  const attendance = raw as Record<string, unknown>;
  const timestamp = new Date(String(attendance.timestamp ?? attendance.createdAt ?? Date.now()));
  return {
    id: id(attendance),
    customerId: id(attendance.customerId),
    gymId: id(attendance.gymId),
    branchId: id(attendance.branchId),
    date: date(attendance.date),
    time: String(attendance.time ?? ""),
    timestamp: timestamp.getTime(),
  };
}

function normalizePayment(raw: unknown): PaymentRequest {
  const payment = raw as Record<string, unknown>;
  return {
    id: id(payment),
    customerId: id(payment.customerId),
    ownerId: id(payment.ownerId),
    planId: id(payment.planId),
    amount: Number(payment.amount ?? 0),
    ...(payment.screenshotUri ? { screenshotUri: String(payment.screenshotUri) } : {}),
    utrNumber: String(payment.utrNumber ?? ""),
    status:
      payment.status === "approved"
        ? "approved"
        : payment.status === "rejected"
          ? "rejected"
          : "pending",
    ...(payment.note ? { note: String(payment.note) } : {}),
    createdAt: dateTime(payment.createdAt),
    ...(payment.reviewedAt ? { reviewedAt: dateTime(payment.reviewedAt) } : {}),
  };
}

export function normalizeDashboard(raw: unknown): DashboardData {
  const data = raw as Record<string, unknown>;
  return {
    owners: Array.isArray(data.owners) ? data.owners.map(normalizeUser) : [],
    customerUsers: Array.isArray(data.customerUsers) ? data.customerUsers.map(normalizeUser) : [],
    subscriptions: Array.isArray(data.subscriptions) ? data.subscriptions.map(normalizeSubscription).filter(Boolean) as Subscription[] : [],
    gyms: Array.isArray(data.gyms) ? data.gyms.map(normalizeGym) : [],
    branches: Array.isArray(data.branches) ? data.branches.map(normalizeBranch) : [],
    plans: Array.isArray(data.plans) ? data.plans.map(normalizePlan) : [],
    customers: Array.isArray(data.customers) ? data.customers.map(normalizeCustomer) : [],
    attendance: Array.isArray(data.attendance) ? data.attendance.map(normalizeAttendance) : [],
    payments: Array.isArray(data.payments) ? data.payments.map(normalizePayment) : [],
    subscription: normalizeSubscription(data.subscription),
  };
}

export const authApi = {
  async login(phone: string, password: string) {
    const data = await apiRequest<{ token: string; user: unknown }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
    setToken(data.token);
    return normalizeUser(data.user);
  },
  async me() {
    const data = await apiRequest<{ user: unknown }>("/admin/me");
    return normalizeUser(data.user);
  },
};

export const adminApi = {
  async dashboard() {
    const data = await apiRequest<unknown>("/admin/dashboard");
    return normalizeDashboard(data);
  },
  async updateOwnerSubscription(ownerId: string, input: { active: boolean; days?: number }) {
    const data = await apiRequest<{ subscription: unknown }>(`/admin/owners/${ownerId}/subscription`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return normalizeSubscription(data.subscription);
  },
};
