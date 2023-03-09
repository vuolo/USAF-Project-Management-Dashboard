import type { DayValue } from "@hassanmojab/react-modern-calendar-datepicker";
import type { contract_award_timeline } from "@prisma/client";

export type contract_award_timeline_using_day_values =
  contract_award_timeline & {
    requirement_plan: DayValue;
    draft_rfp_released: DayValue;
    approved_by_acb: DayValue;
    rfp_released: DayValue;
    proposal_received: DayValue;
    tech_eval_comp: DayValue;
    negotiation_comp: DayValue;
    awarded: DayValue;
    hasBeenUpdated?: boolean;
  };

// type contract_award_timeline = {
//   id: number
//   contract_award_id: number
//   timeline_status: contract_award_timeline_timeline_status | null
//   requirement_plan: Date | null
//   draft_rfp_released: Date | null
//   approved_by_acb: Date | null
//   rfp_released: Date | null
//   proposal_received: Date | null
//   tech_eval_comp: Date | null
//   negotiation_comp: Date | null
//   awarded: Date | null
// }
