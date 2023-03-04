export type all_successors = {
  pred_proj_name: string;
  pred_name: string;
  pred_proj_start: Date;
  pred_proj_end: Date;
  pred_actual_start: Date;
  pred_actual_end: Date;

  succ_proj_name: string;
  succ_name: string;
  succ_proj_start: Date;
  succ_proj_end: Date;
  succ_actual_start: Date;
  succ_actual_end: Date;
};

// p.project_name as pred_proj_name,
// pm.task_name as pred_name,
// pm.start_date as pred_proj_start,
// pm.end_date as pred_proj_end,
// pm.actual_start as pred_actual_start,
// pm.actual_end as pred_actual_end,

// p2.project_name as succ_proj_name,
// pm1.task_name as succ_name,
// pm1.start_date as succ_proj_start,
// pm1.end_date as succ_proj_end,
// pm1.actual_start as succ_actual_start,
// pm1.actual_end as succ_actual_end
