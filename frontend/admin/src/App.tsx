import { useEffect, useState } from "react";
import { emptyDashboard, type ViewKey } from "./app/constants";
import { AppShell } from "./components/AppShell";
import { adminApi, authApi, clearToken, getToken } from "./lib/api";
import { ActivityPage } from "./pages/ActivityPage";
import { LocationsPage } from "./pages/LocationsPage";
import { LoginPage } from "./pages/LoginPage";
import { MembershipsPage } from "./pages/MembershipsPage";
import { OverviewPage } from "./pages/OverviewPage";
import { OwnersPage } from "./pages/OwnersPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import type { DashboardData, User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<DashboardData>(emptyDashboard);
  const [view, setView] = useState<ViewKey>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const next = await adminApi.dashboard();
    setData(next);
  };

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        if (!getToken()) return;
        const me = await authApi.me();
        if (me.role !== "admin") throw new Error("Platform admin login required");
        const dashboard = await adminApi.dashboard();
        if (!mounted) return;
        setUser(me);
        setData(dashboard);
      } catch {
        clearToken();
        if (mounted) {
          setUser(null);
          setData(emptyDashboard);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void boot();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="center-screen">
        <div className="loader" />
      </main>
    );
  }

  if (!user) {
    return (
      <LoginPage
        onAuthed={async (nextUser) => {
          const dashboard = await adminApi.dashboard();
          setUser(nextUser);
          setData(dashboard);
        }}
      />
    );
  }

  return (
    <AppShell
      user={user}
      view={view}
      error={error}
      onViewChange={setView}
      onRefresh={() => {
        setError(null);
        void refresh().catch((err) => setError(err instanceof Error ? err.message : "Refresh failed"));
      }}
      onLogout={() => {
        clearToken();
        setUser(null);
        setData(emptyDashboard);
      }}
    >
      {view === "overview" ? <OverviewPage data={data} setView={setView} /> : null}
      {view === "owners" ? <OwnersPage data={data} onRefresh={refresh} /> : null}
      {view === "memberships" ? <MembershipsPage data={data} /> : null}
      {view === "locations" ? <LocationsPage data={data} /> : null}
      {view === "payments" ? <PaymentsPage data={data} /> : null}
      {view === "activity" ? <ActivityPage data={data} /> : null}
    </AppShell>
  );
}
