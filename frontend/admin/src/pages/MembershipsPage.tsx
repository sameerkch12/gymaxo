import { useMemo, useState } from "react";
import { MembershipTable } from "../components/tables";
import { Panel, Toolbar } from "../components/ui";
import type { DashboardData } from "../types";

export function MembershipsPage({ data }: { data: DashboardData }) {
  const [query, setQuery] = useState("");
  const customers = useMemo(
    () => data.customers.filter((customer) => `${customer.name} ${customer.phone}`.toLowerCase().includes(query.toLowerCase())),
    [data.customers, query],
  );

  return (
    <Panel title="All Memberships">
      <Toolbar query={query} setQuery={setQuery} count={customers.length} placeholder="Search member or phone" />
      <MembershipTable customers={customers} data={data} />
    </Panel>
  );
}
