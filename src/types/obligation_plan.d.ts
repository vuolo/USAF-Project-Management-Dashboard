export type obligation_plan = {
  id: number;
  date: Date;
  FundingType: string;
  FiscalYear: string;
  Projected: number;
  "Projected Total": number;
  Actual: number;
  "Actual Total": number;
};

// id,
// obli_funding_date as date,
// obli_funding_type as FundingType,
// obli_fiscal_year as "FiscalYear",
// obli_projected as Projected,
// obli_projected_total as "Projected Total",
// obli_actual as Actual,
// obli_actual_total as "Actual Total"
