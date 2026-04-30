import { BranchTable, GymTable } from "../components/tables";
import { Panel } from "../components/ui";
import type { DashboardData } from "../types";

export function LocationsPage({ data }: { data: DashboardData }) {
  return (
    <section className="grid two">
      <Panel title="Gyms">
        <GymTable data={data} />
      </Panel>
      <Panel title="Branches">
        <BranchTable data={data} />
      </Panel>
    </section>
  );
}
