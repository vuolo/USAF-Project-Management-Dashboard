import { Chart } from "react-google-charts";
import { api } from "~/utils/api";
import type { all_successors } from "~/types/all_successors";
import { displayTodayLine } from "~/utils/gantt";
import { useEffect } from "react";

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
      ? all_successors.length * 42 + 172
      : 0;
  useEffect(() => displayTodayLine({ all_successors }), [all_successors]);

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-center rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Dependency Graph</h1>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-2 pt-4 text-left sm:px-6 sm:pt-6">
        {/* Display Errors for each successor that has an end date date before the predeccessor's end date. */}
        <div className="w-full text-center">
          {all_successors &&
            all_successors.map((successor, idx) => {
              const predEndDate =
                successor.pred_actual_end &&
                new Date(successor.pred_actual_end).getFullYear() !== 1969
                  ? new Date(successor.pred_actual_end)
                  : successor.pred_proj_end &&
                    new Date(successor.pred_proj_end).getFullYear() !== 1969
                  ? new Date(successor.pred_proj_end)
                  : null;

              const succStartDate =
                successor.succ_actual_start &&
                new Date(successor.succ_actual_start).getFullYear() !== 1969
                  ? new Date(successor.succ_actual_start)
                  : successor.succ_proj_start &&
                    new Date(successor.succ_proj_start).getFullYear() !== 1969
                  ? new Date(successor.succ_proj_start)
                  : null;

              if (succStartDate && predEndDate && succStartDate < predEndDate) {
                return (
                  <div key={idx} className="text-orange-600">
                    <span className="font-bold">Warning:</span> Successor task
                    &quot;{successor.succ_name}&quot; in project &quot;
                    {successor.succ_proj_name}&quot; starts before its
                    predecessor task &quot;{successor.pred_name}&quot; in
                    project &quot;{successor.pred_proj_name}&quot; is complete.
                  </div>
                );
              }
              return null;
            })}
        </div>

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
  const rows: any[] = [];

  successors.map((successor) => {
    rows.push([
      successor.pred_name,
      successor.pred_name,
      getDate(successor.pred_actual_start, successor.pred_proj_start),
      getDate(successor.pred_actual_end, successor.pred_proj_end),
      null,
      getPercentage(successor, true),
      null,
    ]);

    const find = (element: string[]) => element[0] === successor.succ_name;
    const index = rows.findIndex(find);

    if (index === -1) {
      rows.push([
        successor.succ_name,
        successor.succ_name,
        getDate(successor.succ_actual_start, successor.succ_proj_start),
        getDate(successor.succ_actual_end, successor.succ_proj_end),
        null,
        getPercentage(successor, false),
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
      arrow: {
        angle: 100,
        width: 1,
        color: "dodgerblue",
        radius: 0,
      },
      criticalPathStyle: {
        stroke: "#e64a19",
      },
    },
    height: cHeight,
    innerGridTrack: { fill: "#F3F7F9" },
    innerGridDarkTrack: { fill: "#DCE6EC" },
  };

  return options;
};

const getDate = (
  actualDate: string | null | Date,
  projectedDate: string | Date
): Date | null => {
  if (actualDate && new Date(actualDate).getFullYear() !== 1969) {
    return new Date(actualDate);
  } else if (projectedDate && new Date(projectedDate).getFullYear() !== 1969) {
    return new Date(projectedDate);
  } else {
    return null;
  }
};

const getPercentage = (successor: all_successors, isPredecessor: boolean) => {
  const currDate = new Date();
  const actualStartKey = isPredecessor
    ? "pred_actual_start"
    : "succ_actual_start";
  const actualEndKey = isPredecessor ? "pred_actual_end" : "succ_actual_end";
  const projEndKey = isPredecessor ? "pred_proj_end" : "succ_proj_end";

  if (successor[actualStartKey] === null) {
    return 0;
  } else if (successor[actualEndKey] !== null) {
    if (currDate < new Date(successor[actualEndKey])) {
      const start = new Date(successor[actualStartKey]);
      const end = new Date(successor[actualEndKey]);
      const daysElapsed = (+currDate - +start) / (+end - +start);
      return Math.round(Math.min(Math.max(daysElapsed * 100, 0), 100));
    } else return 100;
  } else if (successor[projEndKey] !== null) {
    if (currDate < new Date(successor[projEndKey])) {
      const start = new Date(successor[actualStartKey]);
      const end = new Date(successor[projEndKey]);
      const daysElapsed = (+currDate - +start) / (+end - +start);
      return (
        "Projected " +
        Math.round(Math.min(Math.max(daysElapsed * 100, 0), 100)).toString()
      );
    } else return "Projected 100";
  } else return 0;
};
