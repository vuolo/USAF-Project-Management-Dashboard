import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { addInsightSchema, updateInsightSchema } from "~/validation/insight";

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
});
