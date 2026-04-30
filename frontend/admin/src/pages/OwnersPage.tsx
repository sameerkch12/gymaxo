import { useMemo, useState } from "react";
import { OwnerTable } from "../components/tables";
import { Panel, Toolbar } from "../components/ui";
import { adminApi } from "../lib/api";
import type { DashboardData } from "../types";

export function OwnersPage({ data, onRefresh }: { data: DashboardData; onRefresh: () => Promise<void> }) {
  const [query, setQuery] = useState("");
  const [busyOwnerId, setBusyOwnerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extensionDays, setExtensionDays] = useState<Record<string, number>>({});
  const owners = useMemo(
    () => data.owners.filter((owner) => `${owner.name} ${owner.phone}`.toLowerCase().includes(query.toLowerCase())),
    [data.owners, query],
  );

  const updateSubscription = async (ownerId: string, active: boolean) => {
    setBusyOwnerId(ownerId);
    setError(null);
    try {
      await adminApi.updateOwnerSubscription(ownerId, { active, days: 30 });
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscription update failed");
    } finally {
      setBusyOwnerId(null);
    }
  };

  const extendSubscription = async (ownerId: string) => {
    const days = extensionDays[ownerId] ?? 30;
    setBusyOwnerId(ownerId);
    setError(null);
    try {
      await adminApi.updateOwnerSubscription(ownerId, { active: true, days });
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscription extension failed");
    } finally {
      setBusyOwnerId(null);
    }
  };

  return (
    <Panel title="All Owners">
      <Toolbar query={query} setQuery={setQuery} count={owners.length} placeholder="Search owner or phone" />
      {error ? <div className="notice error">{error}</div> : null}
      <OwnerTable
        owners={owners}
        data={data}
        onSubscriptionChange={updateSubscription}
        onSubscriptionExtend={extendSubscription}
        extensionDays={extensionDays}
        setExtensionDays={setExtensionDays}
        busyOwnerId={busyOwnerId}
      />
    </Panel>
  );
}
