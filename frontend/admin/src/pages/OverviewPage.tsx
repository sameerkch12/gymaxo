import { Metric, Panel } from "../components/ui";
import { AttendanceList, MembershipTable, OwnerTable, PaymentList } from "../components/tables";
import { currency, daysLeft } from "../utils/format";
import type { ViewKey } from "../app/constants";
import type { DashboardData } from "../types";

export function OverviewPage({ data, setView }: { data: DashboardData; setView: (view: ViewKey) => void }) {
  const activeMemberships = data.customers.filter((customer) => customer.active).length;
  const expiredSubscriptions = data.subscriptions.filter((subscription) => daysLeft(subscription.dueDate) < 0).length;
  const pendingPayments = data.payments.filter((payment) => payment.status === "pending");
  const revenue = data.payments
    .filter((payment) => payment.status === "approved")
    .reduce((total, payment) => total + payment.amount, 0);

  return (
    <section className="stack">
      <div className="metrics">
        <Metric label="Owners" value={data.owners.length} detail={`${expiredSubscriptions} expired subscriptions`} />
        <Metric label="Members" value={data.customers.length} detail={`${activeMemberships} active memberships`} />
        <Metric label="Gyms" value={data.gyms.length} detail={`${data.branches.length} branches`} />
        <Metric label="Approved Revenue" value={currency(revenue)} detail={`${pendingPayments.length} pending payments`} />
      </div>
      <div className="grid two">
        <Panel title="Recent Owners" action="Open owners" onAction={() => setView("owners")}>
          <OwnerTable owners={data.owners.slice(0, 6)} data={data} />
        </Panel>
        <Panel title="Expiring Memberships" action="Open memberships" onAction={() => setView("memberships")}>
          <MembershipTable customers={[...data.customers].sort((a, b) => a.endDate.localeCompare(b.endDate)).slice(0, 6)} data={data} />
        </Panel>
      </div>
      <div className="grid two">
        <Panel title="Pending Payments" action="Open payments" onAction={() => setView("payments")}>
          <PaymentList payments={pendingPayments.slice(0, 6)} data={data} />
        </Panel>
        <Panel title="Recent Attendance" action="Open attendance" onAction={() => setView("activity")}>
          <AttendanceList attendance={data.attendance.slice(0, 7)} data={data} />
        </Panel>
      </div>
    </section>
  );
}
