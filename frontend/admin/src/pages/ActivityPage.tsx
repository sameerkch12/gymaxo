import { AttendanceList } from "../components/tables";
import { Panel } from "../components/ui";
import type { DashboardData } from "../types";

export function ActivityPage({ data }: { data: DashboardData }) {
  return (
    <Panel title="Attendance Log">
      <AttendanceList attendance={data.attendance} data={data} />
    </Panel>
  );
}
