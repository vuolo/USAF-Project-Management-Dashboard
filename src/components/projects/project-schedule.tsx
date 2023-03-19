import { useState } from "react";
import { useSession } from "next-auth/react";
import { Chart } from "react-google-charts";
import { api } from "~/utils/api";

import TableProjectSchedule from "./tables/table-project-schedule";

import type { view_project } from "~/types/view_project";
import type { milestone } from "~/types/milestone";
import ModalEditProjectSchedule from "./modals/modal-edit-project-schedule";

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

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Schedule</h1>
        {project.contract_status !== "Closed" &&
          user?.user_role !== "Contractor" &&
          (milestoneSchedules?.length === 0 ? (
            <button className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto">
              Add
            </button>
          ) : (
            <button
              onClick={() => setEditScheduleModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto"
            >
              Edit
            </button>
          ))}
      </div>

      <div className="flex flex-col justify-around gap-2 px-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6 md:flex-row">
        {false ? (
          <p className="text-center italic">
            There is no milestone schedule data available for this project.
          </p>
        ) : (
          <div className="flex w-full flex-col gap-8">
            <TableProjectSchedule milestoneSchedules={milestoneSchedules} />

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

      {/* TODO: Add (Upload) Project Schedule Modal */}

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

function GanttChartDataFormat(milestoneSchedules: milestone[]) {
  const rows: any[] = [];

  milestoneSchedules.map((milestoneSchedule) =>
    rows.push([
      milestoneSchedule.ID.toString(),
      milestoneSchedule.Name,
      new Date(
        milestoneSchedule.ActualStart !== null
          ? milestoneSchedule.ActualStart
          : milestoneSchedule.ProjectedStart
      ),
      new Date(
        milestoneSchedule.ActualEnd !== null
          ? milestoneSchedule.ActualEnd
          : milestoneSchedule.ProjectedEnd
      ),
      null,
      null,
      milestoneSchedule.Predecessors === null
        ? null
        : milestoneSchedule.Predecessors.toString(),
    ])
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = [columns, ...rows];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data;
}

const getOptions = (cHeight: number) => {
  const options = {
    gantt: {
      criticalPathEnabled: true,
      criticalPathStyle: {
        stroke: "#e64a19",
      },
    },
    height: cHeight,
  };

  return options;
};
