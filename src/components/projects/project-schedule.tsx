import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Chart } from "react-google-charts";
import { api } from "~/utils/api";

import TableProjectSchedule from "./tables/table-project-schedule";

import type { view_project } from "~/types/view_project";
import type { milestone } from "~/types/milestone";
import ModalEditProjectSchedule from "./modals/modal-edit-project-schedule";
import { sleep } from "~/utils/misc";
import { displayTodayLine } from "~/utils/gantt";

const columns = [
  { type: "string", label: "Task ID" },
  { type: "string", label: "Task Name" },
  { type: "date", label: "Start" },
  { type: "date", label: "End" },
  { type: "number", label: "Duration" },
  { type: "number", label: "Percent Complete" },
  { type: "string", label: "Dependencies" },
];

function ProjectSchedule({ project }: { project: view_project }) {
  const user = useSession().data?.db_user;
  const { data: milestoneSchedules } = api.milestone.getSchedules.useQuery({
    project_id: project.id,
  });
  const [editScheduleModalOpen, setEditScheduleModalOpen] = useState(false);
  useEffect(
    () => displayTodayLine({ milestoneSchedules }),
    [milestoneSchedules]
  );

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Schedule</h1>
        {project.contract_status !== "Closed" &&
          user?.user_role !== "Contractor" && (
            <button
              onClick={() => setEditScheduleModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto"
            >
              Edit
            </button>
          )}
      </div>

      <div className="flex flex-col justify-around gap-2 px-4 pb-2 pt-4 text-left sm:px-6 sm:pt-6 md:flex-row">
        {false ? (
          <p className="text-center italic">
            There is no milestone schedule data available for this project.
          </p>
        ) : (
          <div className="flex w-full flex-col gap-8">
            <TableProjectSchedule milestoneSchedules={milestoneSchedules} />

            {/* Display Errors */}
            <div className="w-full text-center">
              {milestoneSchedules &&
                milestoneSchedules.map((milestone, idx) => {
                  const milestoneStartDate =
                    milestone.ActualStart &&
                    new Date(milestone.ActualStart).getFullYear() !== 1969
                      ? new Date(milestone.ActualStart)
                      : milestone.ProjectedStart &&
                        new Date(milestone.ProjectedStart).getFullYear() !==
                          1969
                      ? new Date(milestone.ProjectedStart)
                      : null;

                  const milestoneProjectedStartDate =
                    milestone.ProjectedStart &&
                    new Date(milestone.ProjectedStart).getFullYear() !== 1969
                      ? new Date(milestone.ProjectedStart)
                      : null;

                  const milestoneProjectedEndDate =
                    milestone.ProjectedEnd &&
                    new Date(milestone.ProjectedEnd).getFullYear() !== 1969
                      ? new Date(milestone.ProjectedEnd)
                      : null;

                  const milestoneActualStartDate =
                    milestone.ActualStart &&
                    new Date(milestone.ActualStart).getFullYear() !== 1969
                      ? new Date(milestone.ActualStart)
                      : null;

                  const milestoneActualEndDate =
                    milestone.ActualEnd &&
                    new Date(milestone.ActualEnd).getFullYear() !== 1969
                      ? new Date(milestone.ActualEnd)
                      : null;

                  const predecessorEndDate = milestone.Predecessors
                    ? getPredecessorEndDate(
                        milestone.Predecessors,
                        milestoneSchedules
                      )
                    : null;

                  // Check if the projected start date is after the projected end date:
                  if (
                    milestoneProjectedStartDate &&
                    milestoneProjectedEndDate &&
                    milestoneProjectedStartDate > milestoneProjectedEndDate
                  ) {
                    return (
                      <div key={idx} className="text-red-600">
                        <span className="font-bold">Error:</span> Milestone
                        &quot;
                        {milestone.Name}&quot; has a projected start date that
                        is after its projected end date.
                      </div>
                    );
                  }

                  // Check if the actual start date is after the actual end date:
                  if (
                    milestoneActualStartDate &&
                    milestoneActualEndDate &&
                    milestoneActualStartDate > milestoneActualEndDate
                  ) {
                    return (
                      <div key={idx} className="text-red-600">
                        <span className="font-bold">Error:</span> Milestone
                        &quot;
                        {milestone.Name}&quot; has an actual start date that is
                        after its actual end date.
                      </div>
                    );
                  }

                  // for milestones that have a start date before their predecessor's end date:
                  if (
                    milestoneStartDate &&
                    predecessorEndDate &&
                    milestoneStartDate < predecessorEndDate
                  ) {
                    return (
                      <div key={idx} className="text-orange-600">
                        <span className="font-bold">Warning:</span> Milestone
                        &quot;
                        {milestone.Name}&quot; starts before its predecessor
                        milestone &quot;{milestone.Predecessors_Name}&quot; is
                        complete.
                      </div>
                    );
                  }
                  return null;
                })}
            </div>

            {milestoneSchedules && milestoneSchedules.length !== 0 && (
              <Chart
                chartType="Gantt"
                width="100%"
                height="100%"
                options={getOptions(milestoneSchedules.length * 42 + 55)}
                data={GanttChartDataFormat(milestoneSchedules)}
              />
            )}
          </div>
        )}
      </div>

      {/* Edit Project Schedule Modal */}
      <ModalEditProjectSchedule
        project={project}
        milestoneSchedules={milestoneSchedules}
        isOpen={editScheduleModalOpen}
        setIsOpen={setEditScheduleModalOpen}
      />
    </div>
  );
}

export default ProjectSchedule;

// Utility function to get the end date of the predecessor milestone
const getPredecessorEndDate = (
  predecessorId: string,
  milestones: milestone[]
): Date | null => {
  const predecessor = milestones.find((m) => m.ID.toString() === predecessorId);
  return predecessor
    ? predecessor.ActualEnd &&
      new Date(predecessor.ActualEnd).getFullYear() !== 1969
      ? new Date(predecessor.ActualEnd)
      : predecessor.ProjectedEnd &&
        new Date(predecessor.ProjectedEnd).getFullYear() !== 1969
      ? new Date(predecessor.ProjectedEnd)
      : null
    : null;
};

function GanttChartDataFormat(milestoneSchedules: milestone[]) {
  const rows: any[] = [];

  milestoneSchedules.map((milestoneSchedule) => {
    const startDate =
      milestoneSchedule.ActualStart &&
      new Date(milestoneSchedule.ActualStart).getFullYear() !== 1969
        ? new Date(milestoneSchedule.ActualStart)
        : milestoneSchedule.ProjectedStart &&
          new Date(milestoneSchedule.ProjectedStart).getFullYear() !== 1969
        ? new Date(milestoneSchedule.ProjectedStart)
        : null;

    let endDate =
      milestoneSchedule.ActualEnd &&
      new Date(milestoneSchedule.ActualEnd).getFullYear() !== 1969
        ? new Date(milestoneSchedule.ActualEnd)
        : milestoneSchedule.ProjectedEnd &&
          new Date(milestoneSchedule.ProjectedEnd).getFullYear() !== 1969
        ? new Date(milestoneSchedule.ProjectedEnd)
        : null;

    // Check if start and end dates are the same
    if (startDate && endDate && startDate.getTime() === endDate.getTime()) {
      // Add a small amount of time to the end date so it appears as a dot
      endDate = new Date(endDate.getTime() + 1000 * 60 * 60 * 24); // Adding 24 hours
    }

    rows.push([
      milestoneSchedule.ID.toString(),
      milestoneSchedule.Name,
      startDate,
      endDate,
      null,
      getPercentage(milestoneSchedule),
      milestoneSchedule.Predecessors === null
        ? null
        : milestoneSchedule.Predecessors.toString(),
    ]);
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = [columns, ...rows];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data;
}

const getOptions = (cHeight: number) => {
  const options = {
    height: cHeight,
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
      innerGridTrack: { fill: "#F3F7F9" },
      innerGridDarkTrack: { fill: "#DCE6EC" },
    },
  };

  return options;
};

const getPercentage = (milestone: milestone) => {
  const currDate = new Date();

  const validActualStart =
    milestone.ActualStart &&
    new Date(milestone.ActualStart).getFullYear() !== 1969;
  const validActualEnd =
    milestone.ActualEnd && new Date(milestone.ActualEnd).getFullYear() !== 1969;
  const validProjectedEnd =
    milestone.ProjectedEnd &&
    new Date(milestone.ProjectedEnd).getFullYear() !== 1969;

  if (!validActualStart && !validProjectedEnd) return 0;
  else if (validActualEnd) {
    if (currDate < new Date(milestone.ActualEnd)) {
      const start = new Date(milestone.ActualStart);
      const end = new Date(milestone.ActualEnd);
      const daysElapsed = (+currDate - +start) / (+end - +start);
      return Math.round(Math.min(Math.max(daysElapsed * 100, 0), 100));
    } else return 100;
  } else if (validProjectedEnd) {
    if (currDate < new Date(milestone.ProjectedEnd)) {
      const start = new Date(milestone.ActualStart);
      const end = new Date(milestone.ProjectedEnd);
      const daysElapsed = (+currDate - +start) / (+end - +start);
      return (
        "Projected " +
        Math.round(Math.min(Math.max(daysElapsed * 100, 0), 100)).toString()
      );
    } else return "Projected 100";
  } else return 0;
};
