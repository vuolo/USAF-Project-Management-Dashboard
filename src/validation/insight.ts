import * as z from "zod";

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