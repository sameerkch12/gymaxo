import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "gymaxo:authToken";

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  message?: string;
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
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

export function normalizeId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record.id ?? record._id ?? "");
  }
  return String(value);
}

export function normalizeDate(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeDateTime(value: unknown): string {
  if (!value) return new Date().toISOString();
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
}

export function normalizeSubscription(raw: unknown) {
  if (!raw || typeof raw !== "object") return undefined;
  const sub = raw as Record<string, unknown>;
  return {
    active: Boolean(sub.active),
    dueDate: normalizeDate(sub.dueDate),
    monthlyFee: Number(sub.monthlyFee ?? 0),
    ...(sub.lastPaidAt ? { lastPaidAt: normalizeDateTime(sub.lastPaidAt) } : {}),
  };
}
