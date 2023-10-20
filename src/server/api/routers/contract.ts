import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { contract_award_timeline } from "@prisma/client";
import type { contract_days_added } from "~/types/contract_days_added";
import { getIPTMembers } from "~/utils/iptMembers";
import { sendEmail } from "~/utils/email";

export const contractRouter = createTRPCRouter({
  updateContractStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        contract_status: z.enum(["Pre_Award", "Awarded", "Closed"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.db_user;
      if (!user) return null;

      // Get the old contract
      const oldContract = await prisma.contract_award.findUnique({
        where: { id: input.id },
      });
      if (!oldContract || !oldContract.project_id) return null;

      // Get the project
      const project = await prisma.project.findUnique({
        where: { id: oldContract.project_id },
      });
      if (!project) return null;

      // Get all IPT Members for this project
      const iptMembers = await getIPTMembers(oldContract.project_id);

      // Get all IPT Members as users
      const iptMembersUsers = await prisma.users.findMany({
        where: { id: { in: iptMembers.map((iptMember) => iptMember.id) } },
      });

      const updatedContract = await prisma.contract_award.update({
        where: { id: input.id },
        data: { contract_status: input.contract_status },
      });

      // Send email to all IPT Members for this project
      let emailContent = "";
      if (oldContract.contract_status !== input.contract_status)
        emailContent += `Contract status: ${oldContract.contract_status} ---> ${input.contract_status} \n`;
      if (emailContent) {
        for (const iptMember of iptMembersUsers) {
          if (!iptMember.user_email) continue;

          await sendEmail(
            iptMember.user_email,
            `METIS - ${
              project.project_name || "N/A"
            } contract status has been updated by ${user.user_name || "N/A"} (${
              user.user_email || "N/A"
            })`,
            `${user.user_name || "N/A"} (${
              user.user_email || "N/A"
            }) updated the following project in METIS: \n\n${emailContent}\n\n\nLog into the METIS dashboard to view more details.`
          );
        }
      }

      return updatedContract;
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
