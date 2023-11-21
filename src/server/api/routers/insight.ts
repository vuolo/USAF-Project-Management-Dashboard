import { contract_award_timeline } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { addInsightSchema, updateInsightSchema } from "~/validation/insight";

const CONTRACT_AWARD_DAY_FIELDS = [
  "requirement_plan",
  "draft_rfp_released",
  "approved_by_acb",
  "rfp_released",
  "proposal_received",
  "tech_eval_comp",
  "negotiation_comp",
  "awarded"
] as const;
type ContractAwardDayFields = typeof CONTRACT_AWARD_DAY_FIELDS[number];

export const insightRouter = createTRPCRouter({
  getInsight: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const insight = await ctx.prisma.insight.findUnique({
        where: { id: input.id },
      });

      if (!insight)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Insight not found",
        });

      return {
        status: 200,
        message: "Insight found",
        result: insight,
      };
    }),
  getInsights: protectedProcedure
    .input(
      z
        .object({
          is_archived: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.session?.db_user;
      if (!user)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to perform this action",
        });

      const insights = await ctx.prisma.insight.findMany({
        where: {
          is_archived: input?.is_archived,
          created_by_user_id: user.user_role !== "Admin" ? user.id : undefined,
        },
      });

      return {
        status: 200,
        message: "Insight list found",
        result: insights,
      };
    }),
  addInsight: protectedProcedure
    .input(addInsightSchema)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.db_user;
      if (!user)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to perform this action",
        });

      const insight = await ctx.prisma.insight.create({
        data: {
          ...input,
          is_archived: false,
          created_by_user_id: user.id,
        },
      });

      return {
        status: 200,
        message: "Insight added successfully",
        result: insight,
      };
    }),
  updateInsight: protectedProcedure
    .input(updateInsightSchema)
    .mutation(async ({ input, ctx }) => {
      const insight = await ctx.prisma.insight.update({
        where: { id: input.id },
        data: { ...input },
      });

      if (!insight)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Insight not found",
        });

      return {
        status: 200,
        message: "Insight updated successfully",
        result: insight,
      };
    }),
  deleteInsight: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const insight = await ctx.prisma.insight.delete({
        where: { id: input.id },
      });

      if (!insight)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Insight not found",
        });

      return {
        status: 200,
        message: "Insight deleted successfully",
        result: insight,
      };
    }),
  generateInsightContractAwardDays: protectedProcedure.input(z.object({
    id: z.number(),
    field: z.enum(CONTRACT_AWARD_DAY_FIELDS),
    algorithm: z.enum(["average", "todo"]).default("average") // TODO: implement more algorithms
  })).query(async ({ input, ctx }) => {
    type ContractAward = {
      planned?: contract_award_timeline;
      projected?: contract_award_timeline;
      actual?: contract_award_timeline;
    }
    const contractDict: { [id: number]: ContractAward } = {};

    const rawTimeline = await ctx.prisma.contract_award_timeline.findMany();
    rawTimeline.forEach((award) => {
      if (!contractDict[award.contract_award_id]) contractDict[award.contract_award_id] = {};
      switch (award.timeline_status) {
        case "Actual":
          (contractDict[award.contract_award_id] as ContractAward).actual = award;
          break;
        case "Planned":
          (contractDict[award.contract_award_id] as ContractAward).planned = award;
          break;
        case "Projected":
          (contractDict[award.contract_award_id] as ContractAward).projected = award;
          break;
      }
    });

    // This is a copy of the one from utils but without the abs
    function getDayDifference(d1: Date, d2: Date) {
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }

    // Calculate average duration for each 
    const averages = [];
    for (const k in contractDict) {
      const v = contractDict[k] as ContractAward;
      if (!v.actual || !v.planned) continue;
      if (!v.actual[input.field] || !v.planned[input.field]) continue;
      averages.push(getDayDifference(v.actual[input.field] as Date, v.planned[input.field] as Date));
    }

    switch (input.algorithm) {
      case "average":
        // Sum of averages divided by amount
        return averages.reduce((a, b) => a + b, 0) / averages.length;
      default:
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Algorithm not implemented",
        });
    }
  })
});
