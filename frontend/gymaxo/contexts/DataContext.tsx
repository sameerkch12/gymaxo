import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

import {
  apiRequest,
  getSocketUrl,
  getToken,
  normalizeDate,
  normalizeDateTime,
  normalizeId,
} from "@/lib/api";
import {
  Attendance,
  Branch,
  Customer,
  Gym,
  MembershipPlan,
  PaymentRequest,
  PaymentStatus,
  PlanType,
} from "@/lib/types";
import { useAuth } from "./AuthContext";

interface DataContextValue {
  loading: boolean;
  gyms: Gym[];
  branches: Branch[];
  customers: Customer[];
  plans: MembershipPlan[];
  attendance: Attendance[];
  payments: PaymentRequest[];
  ownerPaymentUpiId: string;
  refresh: () => Promise<void>;
  addGym: (input: { name: string; address: string }) => Promise<{ gym: Gym; branch: Branch }>;
  addBranch: (input: {
    gymId: string;
    name: string;
    address: string;
  }) => Promise<Branch>;
  addCustomer: (input: {
    name: string;
    phone: string;
    gymId: string;
    branchId: string;
    planId: string;
    startDate: string;
  }) => Promise<Customer>;
  addPlan: (input: {
    name: string;
    type: PlanType;
    price: number;
  }) => Promise<MembershipPlan>;
  deletePlan: (planId: string) => Promise<void>;
  markAttendance: (input: {
    customerId: string;
    gymId: string;
    branchId: string;
    secret: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  submitPayment: (input: {
    customerId: string;
    planId: string;
    amount: number;
    utrNumber: string;
    note?: string;
    ownerId: string;
  }) => Promise<PaymentRequest>;
  updateOwnerPaymentUpi: (upiId: string) => Promise<string>;
  reviewPayment: (
    paymentId: string,
    status: Exclude<PaymentStatus, "pending">,
  ) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function normalizeGym(raw: any): Gym {
  return {
    id: normalizeId(raw),
    ownerId: normalizeId(raw.ownerId),
    name: String(raw.name ?? ""),
    address: String(raw.address ?? ""),
    createdAt: normalizeDateTime(raw.createdAt),
  };
}

function normalizeBranch(raw: any): Branch {
  return {
    id: normalizeId(raw),
    gymId: normalizeId(raw.gymId),
    ownerId: normalizeId(raw.ownerId),
    name: String(raw.name ?? ""),
    address: String(raw.address ?? ""),
    createdAt: normalizeDateTime(raw.createdAt),
  };
}

function normalizePlan(raw: any): MembershipPlan {
  return {
    id: normalizeId(raw),
    ownerId: normalizeId(raw.ownerId),
    name: String(raw.name ?? ""),
    type: raw.type as PlanType,
    durationDays: Number(raw.durationDays ?? 0),
    price: Number(raw.price ?? 0),
  };
}

function normalizeCustomer(raw: any): Customer {
  return {
    id: normalizeId(raw),
    ownerId: normalizeId(raw.ownerId),
    gymId: normalizeId(raw.gymId),
    branchId: normalizeId(raw.branchId),
    ...(raw.userId ? { userId: normalizeId(raw.userId) } : {}),
    name: String(raw.name ?? ""),
    phone: String(raw.phone ?? ""),
    planId: normalizeId(raw.planId),
    startDate: normalizeDate(raw.startDate),
    endDate: normalizeDate(raw.endDate),
    active: Boolean(raw.active),
    createdAt: normalizeDateTime(raw.createdAt),
  };
}

function normalizeAttendance(raw: any): Attendance {
  const timestampDate = new Date(raw.timestamp ?? raw.createdAt ?? Date.now());
  return {
    id: normalizeId(raw),
    customerId: normalizeId(raw.customerId),
    gymId: normalizeId(raw.gymId),
    branchId: normalizeId(raw.branchId),
    date: normalizeDate(raw.date),
    time: String(raw.time ?? ""),
    timestamp: timestampDate.getTime(),
  };
}

function normalizePayment(raw: any): PaymentRequest {
  return {
    id: normalizeId(raw),
    customerId: normalizeId(raw.customerId),
    ownerId: normalizeId(raw.ownerId),
    planId: normalizeId(raw.planId),
    amount: Number(raw.amount ?? 0),
    ...(raw.screenshotUri ? { screenshotUri: String(raw.screenshotUri) } : {}),
    utrNumber: String(raw.utrNumber ?? ""),
    status: raw.status as PaymentStatus,
    ...(raw.note ? { note: String(raw.note) } : {}),
    createdAt: normalizeDateTime(raw.createdAt),
    ...(raw.reviewedAt ? { reviewedAt: normalizeDateTime(raw.reviewedAt) } : {}),
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [ownerPaymentUpiId, setOwnerPaymentUpiId] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  const reset = useCallback(() => {
    setGyms([]);
    setBranches([]);
    setCustomers([]);
    setPlans([]);
    setAttendance([]);
    setPayments([]);
    setOwnerPaymentUpiId("");
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      reset();
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (user.role === "owner") {
        const data = await apiRequest<{
          gyms: unknown[];
          branches: unknown[];
          plans: unknown[];
          customers: unknown[];
          attendance: unknown[];
          payments: unknown[];
          paymentSettings?: { upiId?: string };
        }>("/owner/dashboard");
        setGyms((data.gyms ?? []).map(normalizeGym));
        setBranches((data.branches ?? []).map(normalizeBranch));
        setPlans((data.plans ?? []).map(normalizePlan));
        setCustomers((data.customers ?? []).map(normalizeCustomer));
        setAttendance((data.attendance ?? []).map(normalizeAttendance));
        setPayments((data.payments ?? []).map(normalizePayment));
        setOwnerPaymentUpiId(String(data.paymentSettings?.upiId ?? ""));
      } else {
        const membershipData = await apiRequest<{
          membership: any | null;
          plans: unknown[];
        }>("/customer/membership");
        const membership = membershipData.membership
          ? normalizeCustomer(membershipData.membership)
          : null;
        setCustomers(membership ? [membership] : []);
        setGyms(
          membershipData.membership?.gymId
            ? [normalizeGym(membershipData.membership.gymId)]
            : [],
        );
        setBranches(
          membershipData.membership?.branchId
            ? [normalizeBranch(membershipData.membership.branchId)]
            : [],
        );
        setPlans((membershipData.plans ?? []).map(normalizePlan));
        if (membership) {
          const paymentSettingsData = await apiRequest<{
            paymentSettings: { upiId?: string };
          }>(`/customer/owner-payment-settings/${membership.ownerId}`);
          setOwnerPaymentUpiId(String(paymentSettingsData.paymentSettings?.upiId ?? ""));
          const history = await apiRequest<{
            attendance: unknown[];
            payments: unknown[];
          }>(`/customer/customers/${membership.id}/history`);
          setAttendance((history.attendance ?? []).map(normalizeAttendance));
          setPayments((history.payments ?? []).map(normalizePayment));
        } else {
          setAttendance([]);
          setPayments([]);
          setOwnerPaymentUpiId("");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [reset, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    let activeSocket: Socket | null = null;

    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    void getToken().then((token) => {
      if (cancelled || !token) return;

      const newSocket = io(getSocketUrl(), {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ["websocket"],
      });

      activeSocket = newSocket;

      newSocket.on("connect", () => {
        console.log("Connected to server");
      });

      newSocket.on("connect_error", (error) => {
        console.log("Socket connection error:", error.message);
      });

      newSocket.on("notification:created", (data) => {
        console.log("Notification received:", data);
      });

      if (user.role === "owner") {
        newSocket.on("payment:submitted", (data) => {
          console.log("Payment submitted:", data);
          if (data.payment) {
            setPayments((current) => [normalizePayment(data.payment), ...current]);
          }
        });

        newSocket.on("payment:updated", (data) => {
          console.log("Payment updated:", data);
          if (data.payment) {
            const payment = normalizePayment(data.payment);
            setPayments((current) =>
              current.map((item) => (item.id === payment.id ? payment : item)),
            );
          }
        });

        newSocket.on("attendance:marked", (data) => {
          console.log("Attendance marked:", data);
          if (data.attendance) {
            const entry = normalizeAttendance(data.attendance);
            setAttendance((current) =>
              current.some((item) => item.id === entry.id) ? current : [entry, ...current],
            );
          }
        });

        newSocket.on("customer:added", (data) => {
          console.log("Customer added:", data);
          if (data.customer) {
            const customer = normalizeCustomer(data.customer);
            setCustomers((current) =>
              current.some((item) => item.id === customer.id) ? current : [customer, ...current],
            );
          }
        });

        newSocket.on("plan:created", (data) => {
          console.log("Plan created:", data);
          if (data.plan) {
            const plan = normalizePlan(data.plan);
            setPlans((current) =>
              current.some((item) => item.id === plan.id) ? current : [plan, ...current],
            );
          }
        });

        newSocket.on("plan:deleted", (data) => {
          console.log("Plan deleted:", data);
          setPlans((current) => current.filter((p) => p.id !== data.planId));
        });

        newSocket.on("payment-settings:updated", (data) => {
          console.log("Payment settings updated:", data);
          setOwnerPaymentUpiId(String(data.upiId ?? ""));
        });

        newSocket.on("subscription:renewed", (data) => {
          console.log("Subscription renewed:", data);
        });

        newSocket.on("subscription:status_changed", (data) => {
          console.log("Subscription status changed:", data);
        });
      } else if (user.role === "customer") {
        newSocket.on("payment:status_changed", (data) => {
          console.log("Payment status changed:", data);
          if (data.customer) {
            const customer = normalizeCustomer(data.customer);
            setCustomers((current) =>
              current.map((item) => (item.id === customer.id ? customer : item)),
            );
          }
          if (data.payment) {
            const payment = normalizePayment(data.payment);
            setPayments((current) =>
              current.map((item) => (item.id === payment.id ? payment : item)),
            );
          }
        });

        newSocket.on("payment-settings:updated", (data) => {
          console.log("Payment settings updated:", data);
          setOwnerPaymentUpiId(String(data.upiId ?? ""));
        });

        newSocket.on("plan:updated", (data) => {
          console.log("Plan updated:", data);
          if (data.action === "created" && data.plan) {
            const plan = normalizePlan(data.plan);
            setPlans((current) =>
              current.some((item) => item.id === plan.id) ? current : [plan, ...current],
            );
          } else if (data.action === "deleted") {
            setPlans((current) => current.filter((p) => p.id !== data.planId));
          }
        });
      }

      setSocket(newSocket);
    });

    return () => {
      cancelled = true;
      activeSocket?.disconnect();
    };
  }, [user]);

  const addGym = useCallback<DataContextValue["addGym"]>(async (input) => {
    const data = await apiRequest<{ gym: unknown; branch: unknown }>("/owner/gyms", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const gym = normalizeGym(data.gym);
    const branch = normalizeBranch(data.branch);
    setGyms((current) => [gym, ...current]);
    setBranches((current) => [branch, ...current]);
    return { gym, branch };
  }, []);

  const addBranch = useCallback<DataContextValue["addBranch"]>(async (input) => {
    const data = await apiRequest<{ branch: unknown }>("/owner/branches", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const branch = normalizeBranch(data.branch);
    setBranches((current) => [branch, ...current]);
    return branch;
  }, []);

  const addPlan = useCallback<DataContextValue["addPlan"]>(async (input) => {
    const data = await apiRequest<{ plan: unknown }>("/owner/plans", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const plan = normalizePlan(data.plan);
    setPlans((current) => [plan, ...current]);
    return plan;
  }, []);

  const deletePlan = useCallback<DataContextValue["deletePlan"]>(async (planId) => {
    await apiRequest<{ id: string }>(`/owner/plans/${planId}`, {
      method: "DELETE",
    });
    setPlans((current) => current.filter((plan) => plan.id !== planId));
  }, []);

  const addCustomer = useCallback<DataContextValue["addCustomer"]>(
    async (input) => {
      const data = await apiRequest<{ customer: unknown }>("/owner/customers", {
        method: "POST",
        body: JSON.stringify(input),
      });
      const customer = normalizeCustomer(data.customer);
      setCustomers((current) => [customer, ...current]);
      return customer;
    },
    [],
  );

  const markAttendance = useCallback<DataContextValue["markAttendance"]>(
    async ({ customerId, gymId, branchId, secret }) => {
      try {
        const data = await apiRequest<{ attendance: unknown }>(
          "/customer/attendance",
          {
            method: "POST",
            body: JSON.stringify({
              customerId,
              gymId,
              branchId,
              secret,
            }),
          },
        );
        const entry = normalizeAttendance(data.attendance);
        setAttendance((current) => [entry, ...current]);
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error ? error.message : "Attendance failed",
        };
      }
    },
    [],
  );

  const submitPayment = useCallback<DataContextValue["submitPayment"]>(
    async ({ customerId, planId, amount, utrNumber, note }) => {
      const data = await apiRequest<{ payment: unknown }>("/customer/payments", {
        method: "POST",
        body: JSON.stringify({ customerId, planId, amount, utrNumber, note }),
      });
      const payment = normalizePayment(data.payment);
      setPayments((current) => [payment, ...current]);
      return payment;
    },
    [],
  );

  const updateOwnerPaymentUpi = useCallback<DataContextValue["updateOwnerPaymentUpi"]>(
    async (upiId) => {
      const data = await apiRequest<{ paymentSettings: { upiId?: string } }>(
        "/owner/payment-settings",
        {
          method: "PATCH",
          body: JSON.stringify({ upiId }),
        },
      );
      const nextUpiId = String(data.paymentSettings?.upiId ?? "");
      setOwnerPaymentUpiId(nextUpiId);
      return nextUpiId;
    },
    [],
  );

  const reviewPayment = useCallback<DataContextValue["reviewPayment"]>(
    async (paymentId, status) => {
      await apiRequest<{ payment: unknown }>(
        `/owner/payments/${paymentId}/review`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );
      await refresh();
    },
    [refresh],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      loading,
      gyms,
      branches,
      customers,
      plans,
      attendance,
      payments,
      ownerPaymentUpiId,
      refresh,
      addGym,
      addBranch,
      addCustomer,
      addPlan,
      deletePlan,
      markAttendance,
      submitPayment,
      reviewPayment,
      updateOwnerPaymentUpi,
    }),
    [
      loading,
      gyms,
      branches,
      customers,
      plans,
      attendance,
      payments,
      ownerPaymentUpiId,
      refresh,
      addGym,
      addBranch,
      addCustomer,
      addPlan,
      deletePlan,
      markAttendance,
      submitPayment,
      reviewPayment,
      updateOwnerPaymentUpi,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
