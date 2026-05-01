import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  apiRequest,
  clearToken,
  getToken,
  normalizeSubscription,
  setToken,
} from "@/lib/api";
import { Role, Subscription, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  loading: boolean;
  login: (
    identifier: string,
    password: string,
    role: Role,
  ) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: {
    name: string;
    phone: string;
    password: string;
    role: Role;
  }) => Promise<{ ok: boolean; error?: string }>;
  requestEmailOtp: (
    email: string,
    role: Role,
  ) => Promise<{ ok: boolean; error?: string; devOtp?: string }>;
  verifyEmailOtp: (input: {
    email: string;
    code: string;
    role: Role;
    name: string;
    phone: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  renewSubscription: () => Promise<Subscription>;
  getOwnerSubscription: (ownerId: string) => Promise<Subscription | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeUser(raw: any): User {
  return {
    id: String(raw.id ?? raw._id),
    name: String(raw.name ?? ""),
    phone: String(raw.phone ?? ""),
    email: raw.email ?? undefined,
    role: raw.role as Role,
    password: "",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    paymentUpiId: String(raw.paymentUpiId ?? ""),
    ...(raw.subscription
      ? { subscription: normalizeSubscription(raw.subscription) }
      : {}),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await apiRequest<{ user: unknown }>("/auth/me");
          setUser(normalizeUser(data.user));
        }
      } catch {
        await clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (identifier: string, password: string, role: Role) => {
      try {
        const data = await apiRequest<{ token: string; user: unknown }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ identifier, password, role }),
          },
        );
        await setToken(data.token);
        setUser(normalizeUser(data.user));
        return { ok: true as const };
      } catch (error) {
        return {
          ok: false as const,
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    },
    [],
  );

  const signup = useCallback(
    async (input: {
      name: string;
      phone: string;
      password: string;
      role: Role;
    }) => {
      try {
        const data = await apiRequest<{ token: string; user: unknown }>(
          "/auth/signup",
          {
            method: "POST",
            body: JSON.stringify(input),
          },
        );
        await setToken(data.token);
        setUser(normalizeUser(data.user));
        return { ok: true as const };
      } catch (error) {
        return {
          ok: false as const,
          error: error instanceof Error ? error.message : "Signup failed",
        };
      }
    },
    [],
  );

  const requestEmailOtp = useCallback(async (email: string, role: Role) => {
    try {
      const data = await apiRequest<{ sent: boolean; devOtp?: string }>(
        "/auth/email-otp/request",
        {
          method: "POST",
          body: JSON.stringify({ email, role }),
        },
      );
      return { ok: true as const, devOtp: data.devOtp };
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : "OTP send failed",
      };
    }
  }, []);

  const verifyEmailOtp = useCallback(
    async (input: {
      email: string;
      code: string;
      role: Role;
      name: string;
      phone: string;
      password: string;
    }) => {
      try {
        const data = await apiRequest<{ token: string; user: unknown }>(
          "/auth/email-otp/verify",
          {
            method: "POST",
            body: JSON.stringify(input),
          },
        );
        await setToken(data.token);
        setUser(normalizeUser(data.user));
        return { ok: true as const };
      } catch (error) {
        return {
          ok: false as const,
          error: error instanceof Error ? error.message : "OTP verification failed",
        };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const renewSubscription = useCallback(async (): Promise<Subscription> => {
    const data = await apiRequest<{ subscription: unknown }>(
      "/owner/subscription/renew",
      { method: "POST" },
    );
    const subscription = normalizeSubscription(data.subscription);
    if (!subscription) throw new Error("Subscription update failed");
    setUser((current) =>
      current ? { ...current, subscription } : current,
    );
    return subscription;
  }, []);

  const getOwnerSubscription = useCallback(
    async (ownerId: string): Promise<Subscription | null> => {
      const data = await apiRequest<{ subscription: unknown }>(
        `/customer/owner-subscription/${ownerId}`,
      );
      return normalizeSubscription(data.subscription) ?? null;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      login,
      signup,
      requestEmailOtp,
      verifyEmailOtp,
      logout,
      renewSubscription,
      getOwnerSubscription,
    }),
    [
      user,
      loading,
      login,
      signup,
      requestEmailOtp,
      verifyEmailOtp,
      logout,
      renewSubscription,
      getOwnerSubscription,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
