import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { contract_award_timeline } from "@prisma/client";
import type { contract_days_added } from "~/types/contract_days_added";

export const contractRouter = createTRPCRouter({
  updateContractStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        contract_status: z.enum(["Pre_Award", "Awarded", "Closed"]),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.contract_award.update({
        where: { id: input.id },
        data: { contract_status: input.contract_status },
      });
    }),
  updateContractNumber: protectedProcedure
    .input(z.object({ id: z.number(), contract_num: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.contract_award.update({
        where: { id: input.id },
        data: { contract_num: input.contract_num },
      });
    }),
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
  addContractAwardTimeline: protectedProcedure
    .input(
      z.object({
        contract_award_id: z.number(),
        requirement_plan: z.date(),
        draft_rfp_released: z.date(),
        approved_by_acb: z.date(),
        rfp_released: z.date(),
        proposal_received: z.date(),
        tech_eval_comp: z.date(),
        negotiation_comp: z.date(),
        awarded: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      return await Promise.all([
        await prisma.$executeRaw`
          INSERT INTO 
            contract_award_timeline (
              contract_award_id,
              timeline_status, 
              requirement_plan, 
              draft_rfp_released, 
              approved_by_acb, 
              rfp_released, 
              proposal_received, 
              tech_eval_comp, 
              negotiation_comp, 
              awarded ) 
            VALUES (
              ${input.contract_award_id},
              "Planned", 
              ${input.requirement_plan}, 
              ${input.draft_rfp_released}, 
              ${input.approved_by_acb}, 
              ${input.rfp_released}, 
              ${input.proposal_received}, 
              ${input.tech_eval_comp}, 
              ${input.negotiation_comp}, 
              ${input.awarded}
            );`,

        // Add the projected and actual timelines as well (these will be empty, but the user can add to them later)
        await prisma.$executeRaw`
          INSERT INTO
            contract_award_timeline (
              contract_award_id,
              timeline_status ) 
          VALUES (
            ${input.contract_award_id},
            "Projected" 
          ),
          (
            ${input.contract_award_id},
            "Actual"
          )`,
      ]);
    }),
  updateContractAwardTimeline: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        contract_award_id: z.number(),
        timeline_status: z.enum(["Planned", "Projected", "Actual"]),
        requirement_plan: z.date().optional(),
        draft_rfp_released: z.date().optional(),
        approved_by_acb: z.date().optional(),
        rfp_released: z.date().optional(),
        proposal_received: z.date().optional(),
        tech_eval_comp: z.date().optional(),
        negotiation_comp: z.date().optional(),
        awarded: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.contract_award_timeline.update({
        where: { id: input.id },
        data: {
          contract_award_id: input.contract_award_id,
          timeline_status: input.timeline_status,

          requirement_plan: input.requirement_plan,
          draft_rfp_released: input.draft_rfp_released,
          approved_by_acb: input.approved_by_acb,
          rfp_released: input.rfp_released,
          proposal_received: input.proposal_received,
          tech_eval_comp: input.tech_eval_comp,
          negotiation_comp: input.negotiation_comp,
          awarded: input.awarded,
        },
      });
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
  addContractAward: protectedProcedure
    .input(
      z.object({
        project_id: z.number(),
        contract_num: z.string(),
        contract_status: z.enum(["Pre_Award", "Awarded", "Closed"]),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.contract_award.create({
        data: {
          project_id: input.project_id,
          contract_num: input.contract_num,
          contract_status: input.contract_status,
        },
      });
    }),
});
