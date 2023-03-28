import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { obligation } from "~/types/obligation";
import type { obligation_plan } from "~/types/obligation_plan";

export const obligationRouter = createTRPCRouter({
  getObligationPlan: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.$queryRaw<obligation_plan[]>`
        SELECT
          id,
          obli_funding_date as date, 
          obli_funding_type as FundingType, 
          obli_fiscal_year as "FiscalYear", 
          obli_projected as Projected,
          obli_projected_total as "Projected Total",
          obli_actual as Actual,
          obli_actual_total as "Actual Total"
        FROM view_obligation 
        WHERE project_id=${input.project_id}
        ORDER BY obli_funding_date`;
    }),
  getTotalObligation: protectedProcedure
    .input(z.object({ project_ids: z.array(z.number()).optional() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.db_user;
      if (!user) return null;

      return (
        // NOTE: This only calculates "Awarded" projects (contract_status = 2)
        (user.user_role === "Admin"
          ? // Select filtered input project_ids if they exist, otherwise select all projects
            input.project_ids && input.project_ids.length > 0
            ? // TODO: make the filtering with project_ids actuallly work... right now it only gets the first ID in the input... (use IN {input.project_ids.join(",")}
              await prisma.$queryRaw<obligation[]>`
                SELECT
                  SUM(obli_projected) as obli_projected,
                  SUM(obli_actual) as obli_actual
                FROM view_obligation vo
                JOIN contract_award ca on vo.project_id = ca.project_id
                WHERE ca.contract_status = 2
                AND (SELECT DATEDIFF((SELECT CURDATE()), vo.obli_funding_date)) >= 0
                AND vo.project_id IN (${Prisma.join(input.project_ids)})`
            : await prisma.$queryRaw<obligation[]>`
                SELECT 
                  SUM(obli_projected) as obli_projected,
                  SUM(obli_actual) as obli_actual
                FROM view_obligation vo
                JOIN contract_award ca on vo.project_id = ca.project_id
                WHERE ca.contract_status = 2 AND (SELECT DATEDIFF((SELECT CURDATE()), vo.obli_funding_date)) >= 0`
          : // TODO: add project_id filtering for non-admins
            await prisma.$queryRaw<obligation[]>`
              SELECT 
                SUM(obli_projected) as obli_projected,
                SUM(obli_actual) as obli_actual
              FROM view_obligation vo
              JOIN user_project_link upl on vo.project_id = upl.project_id
              JOIN contract_award ca on upl.project_id = ca.project_id
              JOIN users u on upl.user_id = u.id
              WHERE u.id = ${user.id} AND ca.contract_status = 2 AND (SELECT DATEDIFF((SELECT CURDATE()), vo.obli_funding_date)) >= 0`
        ).map((obli) => {
          // Map the query result to numbers (for some reason, the query result is a string)
          return {
            obli_actual: Number(obli.obli_actual || 0),
            obli_projected: Number(obli.obli_projected || 0),
          };
        })[0] || null
      );
    }),
  addObligation: protectedProcedure
    .input(
      z.object({
        project_id: z.number(),
        obli_funding_date: z.date(),
        obli_funding_type: z.string(),
        obli_fiscal_year: z.string(),
        obli_projected: z.number(),
        obli_actual: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.obligation_funding_data.create({
        data: { ...input },
      });
    }),
  updateObligation: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        project_id: z.number(),
        obli_funding_date: z.date(),
        obli_funding_type: z.string(),
        obli_fiscal_year: z.string(),
        obli_projected: z.number(),
        obli_actual: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.obligation_funding_data.update({
        where: { id: input.id },
        data: { ...input },
      });
    }),
  deleteObligation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await prisma.obligation_funding_data.delete({
        where: { id: input.id },
      });
    }),
});
