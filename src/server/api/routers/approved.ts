import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const approvedRouter = createTRPCRouter({
  getApprovedFunding: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.approved_funding.findMany({
        where: {
          project_id: input.project_id,
        },
        orderBy: {
          appro_fiscal_year: "asc",
        },
      });
    }),
});
