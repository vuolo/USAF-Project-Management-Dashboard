import type { DayValue } from "@hassanmojab/react-modern-calendar-datepicker";
import type { milestone } from "./milestone";

export type milestone_using_day_values = milestone & {
  ProjectedStart: DayValue;
  ProjectedEnd: DayValue;
  ActualStart: DayValue;
  ActualEnd: DayValue;
  hasBeenUpdated?: boolean;
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
