export type successor = {
  predecessor_project: number;
  predecessor_name: string;
  predecessor_milestone: number;
  predecessor_task_name: string;
  predecessor_task_end_date: Date;

  successor_project: number;
  succ_proj_name: string;
  successor_milestone: number;
  successor_task_name: string;
  successor_task_start_date: Date;
};

// pmd.predecessor_project,
// p1.project_name as predecessor_name,
// pmd.predecessor_milestone,
// pm1.task_name as predecessor_task_name,
// pm1.end_date as predecessor_task_end_date,

// pmd.successor_project,
// p2.project_name as succ_proj_name,
// pmd.successor_milestone,
// pm2.task_name as successor_task_name,
// pm2.start_date as successor_task_start_date
