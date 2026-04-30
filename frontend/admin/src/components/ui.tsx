import type { ReactNode } from "react";
import { daysLeft } from "../utils/format";
import type { Subscription } from "../types";

export function Panel({
  title,
  children,
  action,
  onAction,
}: {
  title: string;
  children: ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <section className="panel">
      <header>
        <h2>{title}</h2>
        {action ? <button className="ghost" onClick={onAction}>{action}</button> : null}
      </header>
      {children}
    </section>
  );
}

export function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export function Badge({ tone, children }: { tone: "green" | "red" | "amber" | "blue"; children: ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function SubscriptionBadge({ subscription }: { subscription?: Subscription | null }) {
  if (!subscription) return <Badge tone="red">Off</Badge>;
  if (!subscription.active) return <Badge tone="red">Off</Badge>;
  const left = daysLeft(subscription.dueDate);
  if (left < 0) return <Badge tone="red">Expired</Badge>;
  if (left <= 5) return <Badge tone="amber">{left}d left</Badge>;
  return <Badge tone="green">Active</Badge>;
}

export function Empty({ message }: { message: string }) {
  return <div className="empty">{message}</div>;
}

export function Toolbar({
  query,
  setQuery,
  count,
  placeholder,
}: {
  query: string;
  setQuery: (value: string) => void;
  count: number;
  placeholder: string;
}) {
  return (
    <div className="toolbar">
      <input placeholder={placeholder} value={query} onChange={(event) => setQuery(event.target.value)} />
      <span>{count} records</span>
    </div>
  );
}

export function NavButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button className={active ? "active" : ""} onClick={onClick}>{label}</button>;
}
