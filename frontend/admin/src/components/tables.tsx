import { Badge, Empty, SubscriptionBadge } from "./ui";
import { currency, shortDate } from "../utils/format";
import type { Attendance, Customer, DashboardData, PaymentRequest, User } from "../types";

export function OwnerTable({
  owners,
  data,
  onSubscriptionChange,
  onSubscriptionExtend,
  extensionDays,
  setExtensionDays,
  busyOwnerId,
}: {
  owners: User[];
  data: DashboardData;
  onSubscriptionChange?: (ownerId: string, active: boolean) => void;
  onSubscriptionExtend?: (ownerId: string) => void;
  extensionDays?: Record<string, number>;
  setExtensionDays?: (days: Record<string, number>) => void;
  busyOwnerId?: string | null;
}) {
  if (!owners.length) return <Empty message="No owners found" />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Owner</th>
            <th>Phone</th>
            <th>Gyms</th>
            <th>Members</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Due</th>
            <th>Last Paid</th>
            <th>Extend</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {owners.map((owner) => {
            const subscription = data.subscriptions.find((item) => item.ownerId === owner.id);
            const enabled = Boolean(subscription?.active);
            const days = extensionDays?.[owner.id] ?? 30;
            return (
              <tr key={owner.id}>
                <td><strong>{owner.name}</strong></td>
                <td>{owner.phone}</td>
                <td>{data.gyms.filter((gym) => gym.ownerId === owner.id).length}</td>
                <td>{data.customers.filter((customer) => customer.ownerId === owner.id).length}</td>
                <td>{subscription ? `${currency(subscription.monthlyFee)} / month` : "-"}</td>
                <td><SubscriptionBadge subscription={subscription} /></td>
                <td>{shortDate(subscription?.dueDate)}</td>
                <td>{shortDate(subscription?.lastPaidAt)}</td>
                <td>
                  {onSubscriptionExtend && setExtensionDays ? (
                    <div className="subscription-actions">
                      <input
                        aria-label={`Days to add for ${owner.name}`}
                        min={1}
                        max={365}
                        type="number"
                        value={days}
                        onChange={(event) => {
                          const nextDays = Math.min(365, Math.max(1, Number(event.target.value) || 1));
                          setExtensionDays({ ...(extensionDays ?? {}), [owner.id]: nextDays });
                        }}
                      />
                      <button
                        className="primary small"
                        disabled={busyOwnerId === owner.id}
                        onClick={() => onSubscriptionExtend(owner.id)}
                      >
                        Add days
                      </button>
                    </div>
                  ) : null}
                </td>
                <td>
                  {onSubscriptionChange ? (
                    <button
                      className={enabled ? "ghost danger" : "primary small"}
                      disabled={busyOwnerId === owner.id}
                      onClick={() => onSubscriptionChange(owner.id, !enabled)}
                    >
                      {busyOwnerId === owner.id ? "Saving..." : enabled ? "Turn off" : "Turn on"}
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MembershipTable({ customers, data }: { customers: Customer[]; data: DashboardData }) {
  if (!customers.length) return <Empty message="No memberships found" />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Member</th><th>Phone</th><th>Owner</th><th>Gym</th><th>Branch</th><th>Plan</th><th>Expiry</th><th>Status</th></tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td><strong>{customer.name}</strong></td>
              <td>{customer.phone}</td>
              <td>{data.owners.find((owner) => owner.id === customer.ownerId)?.name ?? "-"}</td>
              <td>{data.gyms.find((gym) => gym.id === customer.gymId)?.name ?? "-"}</td>
              <td>{data.branches.find((branch) => branch.id === customer.branchId)?.name ?? "-"}</td>
              <td>{data.plans.find((plan) => plan.id === customer.planId)?.name ?? "-"}</td>
              <td>{shortDate(customer.endDate)}</td>
              <td><Badge tone={customer.active ? "green" : "red"}>{customer.active ? "Active" : "Inactive"}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GymTable({ data }: { data: DashboardData }) {
  if (!data.gyms.length) return <Empty message="No gyms found" />;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Gym</th><th>Owner</th><th>Address</th><th>Branches</th><th>Members</th></tr></thead>
        <tbody>
          {data.gyms.map((gym) => (
            <tr key={gym.id}>
              <td><strong>{gym.name}</strong></td>
              <td>{data.owners.find((owner) => owner.id === gym.ownerId)?.name ?? "-"}</td>
              <td>{gym.address}</td>
              <td>{data.branches.filter((branch) => branch.gymId === gym.id).length}</td>
              <td>{data.customers.filter((customer) => customer.gymId === gym.id).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BranchTable({ data }: { data: DashboardData }) {
  if (!data.branches.length) return <Empty message="No branches found" />;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Branch</th><th>Gym</th><th>Owner</th><th>Address</th><th>Members</th><th>Check-ins</th></tr></thead>
        <tbody>
          {data.branches.map((branch) => (
            <tr key={branch.id}>
              <td><strong>{branch.name}</strong></td>
              <td>{data.gyms.find((gym) => gym.id === branch.gymId)?.name ?? "-"}</td>
              <td>{data.owners.find((owner) => owner.id === branch.ownerId)?.name ?? "-"}</td>
              <td>{branch.address}</td>
              <td>{data.customers.filter((customer) => customer.branchId === branch.id).length}</td>
              <td>{data.attendance.filter((entry) => entry.branchId === branch.id).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PaymentList({ payments, data }: { payments: PaymentRequest[]; data: DashboardData }) {
  if (!payments.length) return <Empty message="No payments found" />;
  return (
    <div className="payment-list">
      {payments.map((payment) => {
        const customer = data.customers.find((item) => item.id === payment.customerId);
        const owner = data.owners.find((item) => item.id === payment.ownerId);
        const plan = data.plans.find((item) => item.id === payment.planId);
        return (
          <article className="payment-row" key={payment.id}>
            <div>
              <strong>{customer?.name ?? "Customer"}</strong>
              <span>{owner?.name ?? "Owner"} | {plan?.name ?? "Plan"} | {shortDate(payment.createdAt)}</span>
              {payment.utrNumber ? <p>UTR: {payment.utrNumber}</p> : null}
              {payment.note ? <p>{payment.note}</p> : null}
            </div>
            <div className="payment-side">
              <strong>{currency(payment.amount)}</strong>
              <Badge tone={payment.status === "approved" ? "green" : payment.status === "rejected" ? "red" : "amber"}>
                {payment.status}
              </Badge>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function AttendanceList({ attendance, data }: { attendance: Attendance[]; data: DashboardData }) {
  if (!attendance.length) return <Empty message="No attendance found" />;
  return (
    <div className="activity-list">
      {attendance.map((entry) => {
        const customer = data.customers.find((item) => item.id === entry.customerId);
        const branch = data.branches.find((item) => item.id === entry.branchId);
        const gym = data.gyms.find((item) => item.id === entry.gymId);
        return (
          <div className="activity" key={entry.id}>
            <div className="dot" />
            <div>
              <strong>{customer?.name ?? "Member"}</strong>
              <span>{gym?.name ?? "Gym"} | {branch?.name ?? "Branch"} | {shortDate(entry.date)} {entry.time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
