import { Badge, NavButton } from "./ui";
import { viewTitle, type ViewKey } from "../app/constants";
import type { User } from "../types";

const navItems: Array<{ key: ViewKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "owners", label: "Owners" },
  { key: "memberships", label: "Memberships" },
  { key: "locations", label: "Gyms & Branches" },
  { key: "payments", label: "Payments" },
  { key: "activity", label: "Attendance" },
];

export function AppShell({
  user,
  view,
  onViewChange,
  onRefresh,
  onLogout,
  error,
  children,
}: {
  user: User;
  view: ViewKey;
  onViewChange: (view: ViewKey) => void;
  onRefresh: () => void;
  onLogout: () => void;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">G</div>
          <div>
            <strong>Gymaxo</strong>
            <span>Platform Admin</span>
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavButton
              key={item.key}
              active={view === item.key}
              label={item.label}
              onClick={() => onViewChange(item.key)}
            />
          ))}
        </nav>
        <button className="ghost" onClick={onRefresh}>Refresh</button>
        <button className="ghost danger" onClick={onLogout}>Logout</button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">All India Platform View</p>
            <h1>{viewTitle(view)}</h1>
          </div>
          <Badge tone="blue">{user.name}</Badge>
        </header>

        {error ? <div className="notice error">{error}</div> : null}
        {children}
      </main>
    </div>
  );
}
