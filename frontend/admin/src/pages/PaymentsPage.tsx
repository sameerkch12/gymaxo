import { useState } from "react";
import { PaymentList } from "../components/tables";
import { Panel } from "../components/ui";
import type { DashboardData } from "../types";

export function PaymentsPage({ data }: { data: DashboardData }) {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const payments = data.payments.filter((payment) => payment.status === tab);

  return (
    <section className="stack">
      <div className="segmented narrow">
        {(["pending", "approved", "rejected"] as const).map((status) => (
          <button key={status} className={tab === status ? "active" : ""} onClick={() => setTab(status)}>
            {status}
          </button>
        ))}
      </div>
      <Panel title={`${tab[0].toUpperCase()}${tab.slice(1)} Payments`}>
        <PaymentList payments={payments} data={data} />
      </Panel>
    </section>
  );
}
