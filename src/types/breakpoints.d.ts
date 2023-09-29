export type breakpoints = {
  // Obligation
  obli_yellow_breakpoint: number;
  obli_red_breakpoint: number;

  // Expenditure
  expen_yellow_breakpoint: number;
  expen_red_breakpoint: number;

  // TODO: implement Schedule Days breakpoints sliders on admin page
  schedule_days_yellow?: number;
  schedule_days_red?: number;

  // TODO: implement Dependency Days breakpoints sliders on admin page
  dependency_days_green?: number;
  dependency_days_red?: number;
};
