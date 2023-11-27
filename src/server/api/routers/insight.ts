import { contract_award_timeline, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  addInsightSchema,
  CONTRACT_AWARD_DAY_TIMELINE_STATUSES,
  updateInsightSchema,
} from "~/validation/insight";

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

  // Generate Insight Results - Contract Award Days (Analysis Type)
  generateInsightResults_AT_CAD: protectedProcedure
    .input(
      z.object({
        id: z.number(),
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      type ContractAward = {
        planned?: contract_award_timeline;
        projected?: contract_award_timeline;
        actual?: contract_award_timeline;
      };
      const contractDict: { [id: number]: ContractAward } = {};

      // Setup the custom "where" condition
      type ContractAwardWhereCondition = {
        project_id?: { in: number[] };
        contract_status?: { in: string[] };
        contract_value?: { gte: number };
      };
      type WhereCondition = {
        AND?: Array<{ [key: string]: any }>;
        contract_award?:
          | ContractAwardWhereCondition
          | { AND: ContractAwardWhereCondition[] };
      };

      const whereCondition: WhereCondition = {};

      // Project IDs
      if (input.options?.project_ids) {
        whereCondition.contract_award = {
          ...whereCondition.contract_award,
          project_id: { in: input.options.project_ids },
        };
      }

      // Start and End Dates TODO: validate this logic
      if (input.options?.startDate || input.options?.endDate) {
        whereCondition.AND = whereCondition.AND || [];
        if (input.options.startDate) {
          whereCondition.AND.push({
            [input.timeline_status]: { gte: input.options.startDate },
          });
        }
        if (input.options.endDate) {
          whereCondition.AND.push({
            [input.timeline_status]: { lte: input.options.endDate },
          });
        }
      }

      // Contract Status TODO: validate this logic
      if (input.options?.contract_status) {
        whereCondition.contract_award = {
          ...whereCondition.contract_award,
          contract_status: { in: input.options.contract_status },
        };
      }

      // Thresholds TODO: validate this logic
      if (input.options?.threshold?.minContractValue) {
        whereCondition.contract_award = {
          ...whereCondition.contract_award,
          contract_value: { gte: input.options.threshold.minContractValue },
        };
      }

      // Get all contract awards that match the conditions
      const rawTimeline = await ctx.prisma.contract_award_timeline.findMany({
        where: whereCondition as Prisma.contract_award_timelineWhereInput,
        include: {
          contract_award: true,
        },
      });

      // Create a dictionary of contract awards with the timeline statuses as keys
      rawTimeline.forEach((award) => {
        if (!contractDict[award.contract_award_id])
          contractDict[award.contract_award_id] = {};
        switch (award.timeline_status) {
          case "Actual":
            (contractDict[award.contract_award_id] as ContractAward).actual =
              award;
            break;
          case "Planned":
            (contractDict[award.contract_award_id] as ContractAward).planned =
              award;
            break;
          case "Projected":
            (contractDict[award.contract_award_id] as ContractAward).projected =
              award;
            break;
        }
      });

      console.log(contractDict);
      // stats of contractDict:
      console.log(
        Object.keys(contractDict).length,
        Object.keys(contractDict).filter(
          (key) =>
            contractDict[key]?.actual &&
            (contractDict[key]?.projected || contractDict[key]?.planned)
        ).length
      );
      console.log("...");

      // Calculate day differences for each contract award
      // Note: This is a copy of the one from utils but without the abs
      function getDayDifference(d1: Date, d2: Date) {
        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      }
      const dayDifferences = [];
      for (const contractAward of Object.values(contractDict)) {
        const actualDate = contractAward.actual?.[input.timeline_status];
        const projectedDate = contractAward.projected?.[input.timeline_status];
        const plannedDate = contractAward.planned?.[input.timeline_status];

        console.log(actualDate, projectedDate || plannedDate);

        if (actualDate && (projectedDate || plannedDate)) {
          dayDifferences.push(
            getDayDifference(
              new Date(actualDate),
              new Date(projectedDate || (plannedDate as Date))
            )
          );
        }
      }

      // Create the result object
      const results = {
        average: 0,
        dayDifferences,
      };

      // Calculate the average based on the algorithm
      switch (input.algorithm) {
        case "average":
          // Calculate the average of day differences, return 0 if the array is empty
          const average =
            dayDifferences.length > 0
              ? dayDifferences.reduce((a, b) => a + b, 0) /
                dayDifferences.length
              : 0;
          results.average = average;
          break;
        default:
          throw new TRPCError({
            code: "NOT_IMPLEMENTED",
            message: "Algorithm not implemented",
          });
      }

      // Update the insight at input.id with the result and options
      const updatedInsight = await ctx.prisma.insight.update({
        where: { id: input.id },
        data: {
          options: {
            ...input.options,
            analysis_type: "AT_CAD",
            timeline_status: input.timeline_status,
            algorithm: input.algorithm,
          },
          results: { ...results },
          generated_at: new Date(),
        },
      });

      // Finally, return the result
      return {
        status: 200,
        message: "Insight results generated successfully",
        result: updatedInsight,
      };
    }),
});
