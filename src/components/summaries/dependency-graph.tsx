import { Chart } from "react-google-charts";
import { api } from "~/utils/api";
import type { all_successors } from "~/types/all_successors";

const columns = [
  { type: "string", label: "Task ID" },
  { type: "string", label: "Task Name" },
  { type: "date", label: "Start Date" },
  { type: "date", label: "End Date" },
  { type: "number", label: "Duration" },
  { type: "number", label: "Percent Complete" },
  { type: "string", label: "Dependencies" },
];

function DependencyGraph() {
  const { data: all_successors } = api.dependency.getAllSuccessors.useQuery();

  const chartHeight =
    all_successors && all_successors.length > 0
      ? all_successors.length * 42 + 100
      : 0;

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-center rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Dependency Graph</h1>
      </div>

      <div className="flex flex-col justify-around gap-4 px-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6 lg:flex-row">
        {!all_successors ? (
          <p className="italic">Loading...</p>
        ) : all_successors.length === 0 ? (
          <p className="italic">
            No dependencies found, make sure you are assigned to projects...
          </p>
        ) : (
          <Chart
            chartType="Gantt"
            width="100%"
            height="100%"
            options={getOptions(chartHeight)}
            data={GanttChartDataFormat(all_successors)}
          />
        )}
      </div>
    </div>
  );
}

export default DependencyGraph;

function GanttChartDataFormat(successors: all_successors[]) {
  const rows: any = [];

  successors.map((successor) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    rows.push([
      successor.pred_name,
      successor.pred_name,
      successor.pred_actual_start !== null
        ? new Date(successor.pred_actual_start)
        : new Date(successor.pred_proj_start),
      successor.pred_actual_end !== null
        ? new Date(successor.pred_actual_end)
        : new Date(successor.pred_proj_end),
      null,
      "undefined",
      null,
    ]);
    const find = (element: string[]) => element[0] === successor.succ_name;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const index = rows.findIndex(find);
    if (index === -1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      rows.push([
        successor.succ_name,
        successor.succ_name,
        successor.succ_actual_start !== null
          ? new Date(successor.succ_actual_start)
          : new Date(successor.succ_proj_start),
        successor.succ_actual_end !== null
          ? new Date(successor.succ_actual_end)
          : new Date(successor.succ_proj_end),
        null,
        "undefined",
        successor.pred_name,
      ]);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (rows[index][6] === null) rows[index][6] = successor.pred_name;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-plus-operands
      else rows[index][6] = rows[index][6] + ", " + successor.pred_name;
    }
    return 0;
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = [columns, ...rows];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data;
}

const getOptions = (cHeight: number) => {
  const options = {
    gantt: {
      criticalPathEnabled: false,
      criticalPathStyle: {
        stroke: "#e64a19",
      },
    },
  };
  return options;
};
