import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { approved_estimates } from "~/types/approved_estimates";

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
  updateApprovedFunding: protectedProcedure
    .input(
      z.object({
        approvedID: z.number(),
        projectID: z.number(),
        appro_funding_type: z.number(),
        appro_fiscal_year: z.number(),
        approved_amount: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.approved_funding.update({
        where: {
          id: input.approvedID,
        },
        data: {
          project_id: input.projectID,
          appro_funding_type: input.appro_funding_type,
          appro_fiscal_year: input.appro_fiscal_year,
          approved_amount: input.approved_amount,
        },
      });
    }),

  getEstimates: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return (
        (
          await prisma.$queryRaw<approved_estimates[]>`
            SELECT 
                contract_value,
                ind_gov_est
            FROM view_contract_award
            WHERE project_id = ${input.project_id}`
        ).map((est) => {
          return {
            contract_value: Number(est.contract_value || 0),
            ind_gov_est: Number(est.ind_gov_est || 0),
          };
        })[0] || null
      );
    }),
});
