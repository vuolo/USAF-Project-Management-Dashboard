import * as z from "zod";

export const CONTRACT_AWARD_DAY_TIMELINE_STATUSES = [
  "requirement_plan",
  "draft_rfp_released",
  "approved_by_acb",
  "rfp_released",
  "proposal_received",
  "tech_eval_comp",
  "negotiation_comp",
  "awarded",
] as const;
export type ContractAwardDayTimelineStatuses =
  (typeof CONTRACT_AWARD_DAY_TIMELINE_STATUSES)[number];

// Add Insight
export const addInsightSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  options: z.object({}).optional(), // TODO: Add options schema
});
export type IAddInsight = z.infer<typeof addInsightSchema>;

// Update Insight
export const updateInsightSchema = addInsightSchema.extend({
  id: z.number(),
  name: z.string().optional(),
  is_archived: z.boolean().optional(),
});
export type IUpdateInsight = z.infer<typeof updateInsightSchema>;

// ~Insight Options
export const updateInsightOptionsSchema = z.object({
  id: z.number(),
  analysis_type: z.enum(["AT_CAD"]),
  timeline_status: z.enum(CONTRACT_AWARD_DAY_TIMELINE_STATUSES),
  algorithm: z.enum(["average", "todo"]).default("average"), // TODO: implement more algorithms
  options: z
    .object({
      project_ids: z.array(z.number()).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      contract_status: z
        .array(z.enum(["Pre_Award", "Awarded", "Closed"]))
        .optional(),
      threshold: z
        .object({
          minContractValue: z.number().optional(),
          maxDaysDelayed: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
});
export type IUpdateInsightOptions = z.infer<typeof updateInsightOptionsSchema>;
