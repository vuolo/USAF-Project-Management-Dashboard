import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { breakpoints } from "~/types/breakpoints";

export const financialSummaryRouter = createTRPCRouter({
  getBreakpoints: protectedProcedure.query(async () => {
    return (
      (
        await prisma.$queryRaw<breakpoints[]>`
      SELECT 
        obli_yellow_breakpoint,
        obli_red_breakpoint,
        expen_yellow_breakpoint,
        expen_red_breakpoint
      FROM financial_summary_breakpoints`
      )[0] || null
    );
  }),
  updateBreakpoints: protectedProcedure
    .input(
      z.object({
        obli_yellow_breakpoint: z.number(),
        obli_red_breakpoint: z.number(),
        expen_yellow_breakpoint: z.number(),
        expen_red_breakpoint: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.$executeRaw`
        UPDATE financial_summary_breakpoints
        SET
          obli_yellow_breakpoint = ${input.obli_yellow_breakpoint},
          obli_red_breakpoint = ${input.obli_red_breakpoint},
          expen_yellow_breakpoint = ${input.expen_yellow_breakpoint},
          expen_red_breakpoint = ${input.expen_red_breakpoint}`;
    }),
});
