import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { breakpoints } from "~/types/breakpoints";

const BreakpointsInput = z.object({
  obli_yellow_breakpoint: z.number(),
  obli_red_breakpoint: z.number(),
  expen_yellow_breakpoint: z.number(),
  expen_red_breakpoint: z.number(),
  schedule_days_yellow: z.number().optional(),
  schedule_days_red: z.number().optional(),
  dependency_days_green: z.number().optional(),
  dependency_days_red: z.number().optional(),
});

export const financialSummaryRouter = createTRPCRouter({
  getBreakpoints: protectedProcedure.query(async () => {
    return (
      (
        await prisma.$queryRaw<breakpoints[]>`
      SELECT 
        obli_yellow_breakpoint,
        obli_red_breakpoint,
        expen_yellow_breakpoint,
        expen_red_breakpoint,
        schedule_days_yellow,
        schedule_days_red,
        dependency_days_green,
        dependency_days_red
      FROM financial_summary_breakpoints`
      )[0] || null
    );
  }),
  updateBreakpoints: protectedProcedure
    .input(BreakpointsInput)
    .mutation(async ({ input }) => {
      // Add new fields to the update statement
      return await prisma.$executeRaw`
        UPDATE financial_summary_breakpoints
        SET
          obli_yellow_breakpoint = ${input.obli_yellow_breakpoint},
          obli_red_breakpoint = ${input.obli_red_breakpoint},
          expen_yellow_breakpoint = ${input.expen_yellow_breakpoint},
          expen_red_breakpoint = ${input.expen_red_breakpoint},
          schedule_days_yellow = ${input.schedule_days_yellow},
          schedule_days_red = ${input.schedule_days_red},
          dependency_days_green = ${input.dependency_days_green},
          dependency_days_red = ${input.dependency_days_red}`;
    }),
});
