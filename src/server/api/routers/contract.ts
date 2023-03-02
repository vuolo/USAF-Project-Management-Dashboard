import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { contract_award_timeline } from "@prisma/client";
import type { contract_days_added } from "~/types/contract_days_added";

export const contractRouter = createTRPCRouter({
  getDaysAdded: protectedProcedure.query(async () => {
    return (
      (
        await prisma.$queryRaw<contract_days_added[]>`
          SELECT *
          FROM contract_days_added`
      )[0] || null
    );
  }),
  updateDaysAdded: protectedProcedure
    .input(
      z.object({
        draft_rfp_released: z.number(),
        approved_by_acb: z.number(),
        rfp_released: z.number(),
        proposal_received: z.number(),
        tech_eval_comp: z.number(),
        negotiation_comp: z.number(),
        awarded: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.$executeRaw`
        UPDATE contract_days_added
        SET
          draft_rfp_released = ${input.draft_rfp_released},
          approved_by_acb = ${input.approved_by_acb},
          rfp_released = ${input.rfp_released},
          proposal_received = ${input.proposal_received},
          tech_eval_comp = ${input.tech_eval_comp},
          negotiation_comp = ${input.negotiation_comp},
          awarded = ${input.awarded}`;
    }),
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
