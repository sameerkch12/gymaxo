import type { DashboardData } from "../types";

export type ViewKey = "overview" | "owners" | "memberships" | "locations" | "payments" | "activity";

export const emptyDashboard: DashboardData = {
  owners: [],
  customerUsers: [],
  subscriptions: [],
  gyms: [],
  branches: [],
  plans: [],
  customers: [],
  attendance: [],
  payments: [],
  subscription: null,
};

export function viewTitle(view: ViewKey) {
  return {
    overview: "Overview",
    owners: "Owners",
    memberships: "Memberships",
    locations: "Gyms & Branches",
    payments: "Payments",
    activity: "Attendance",
  }[view];
}
