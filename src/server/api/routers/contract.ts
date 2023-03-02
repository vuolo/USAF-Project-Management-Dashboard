import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { contract_award_timeline } from "@prisma/client";

export const contractRouter = createTRPCRouter({
  getContractAwardTimeline: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.$queryRaw<contract_award_timeline[]>`
        SELECT 
          cat.id,
          cat.contract_award_id,
          cat.timeline_status,
          cat.requirement_plan, 
          cat.draft_rfp_released,
          cat.approved_by_acb, 
          cat.rfp_released,
          cat.proposal_received,
          cat.tech_eval_comp, 
          cat.negotiation_comp, 
          cat.awarded
        FROM contract_award ca
        INNER JOIN contract_award_timeline cat ON cat.contract_award_id = ca.id
        WHERE project_id = ${input.project_id}`;
    }),
  getContractAward: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return (
        (
          await prisma.contract_award.findMany({
            where: {
              project_id: input.project_id,
            },
          })
        )[0] || null
      );
    }),
});
