import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { breakpoints } from "~/types/breakpoints";

export const financialSummaryRouter = createTRPCRouter({
  getBreakpoints: protectedProcedure.query(async () => {
    return (
      await prisma.$queryRaw<breakpoints[]>`
      SELECT 
        obli_yellow_breakpoint,
        obli_red_breakpoint,
        expen_yellow_breakpoint,
        expen_red_breakpoint
      FROM financial_summary_breakpoints`
    )[0];
  }),
});
