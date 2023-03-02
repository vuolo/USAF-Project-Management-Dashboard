export type milestone = {
  ID: number;
  project_id: number;
  Name: string;
  Duration: number;
  ProjectedStart: Date;
  ProjectedEnd: Date;
  ActualStart: Date;
  ActualEnd: Date;
};

// pm.id as ID,
// pm.project_id,
// pm.task_name as "Name",
// DATEDIFF(pm.end_date,pm.start_date) as "Duration",
// pm.start_date as "ProjectedStart",
// pm.end_date as "ProjectedEnd",
// pm.actual_start as "ActualStart",
// pm.actual_end as "ActualEnd",
