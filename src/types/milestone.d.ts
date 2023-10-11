import { view_project } from "./view_project";

export type milestone = {
  ID: number;
  project_id: number;
  Name: string;
  Duration: number;
  ProjectedStart: Date;
  ProjectedEnd: Date;
  ActualStart: Date;
  ActualEnd: Date;
  Predecessors: string;
  Predecessors_Name: string;
};

// pm.id as ID,
// pm.project_id,
// pm.task_name as "Name",
// DATEDIFF(pm.end_date,pm.start_date) as "Duration",
// pm.start_date as "ProjectedStart",
// pm.end_date as "ProjectedEnd",
// pm.actual_start as "ActualStart",
// pm.actual_end as "ActualEnd",
// "Predecessors",
// "Predecessors_Name"

export type CountedDependency = {
  pred_project_id: number;
  pred_project_name: string;
  pred_milestone_id: number;
  pred_milestone_name: string;
  pred_milestone_date?: Date;

  succ_project_id: number;
  succ_project_name: string;
  succ_milestone_id: number;
  succ_milestone_name: string;
  succ_milestone_date?: Date;

  date_margin: bigint;
  date_difference: bigint;
};

export type ScheduleSummaryWithProjects = {
  greenProjects: ProjectMilestoneSummary[];
  yellowProjects: ProjectMilestoneSummary[];
  redProjects: ProjectMilestoneSummary[];
};

export type ProjectMilestoneSummary = view_project & {
  date_difference: number;
  earliest_milestone_name: string | null;
  earliest_milestone_date: Date | null;
};
