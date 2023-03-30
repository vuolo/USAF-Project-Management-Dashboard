import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { expenditure } from "~/types/expenditure";
import type { expenditure_plan } from "~/types/expenditure_plan";

export const expenditureRouter = createTRPCRouter({
  getExpenditurePlan: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.$queryRaw<expenditure_plan[]>`
        SELECT 
          id,
          expen_funding_date as date,
          expen_projected as Projected, 
          expen_projected_total as "Projected Total",
          expen_actual as Actual,
          expen_actual_total as "Actual Total"
        FROM view_expenditure 
        WHERE project_id=${input.project_id}
        ORDER BY expen_funding_date`;
    }),
  getTotalExpenditure: protectedProcedure
    .input(z.object({ project_ids: z.array(z.number()).optional() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.db_user;
      if (!user) return null;

      return (
        // NOTE: This only calculates "Awarded" projects (contract_status = 2)
        (user.user_role === "Admin" || user.user_role === "IPT_Member"
          ? // Select filtered input project_ids if they exist, otherwise select all projects
            input.project_ids && input.project_ids.length > 0
            ? await prisma.$queryRaw<expenditure[]>`
              SELECT 
                SUM(expen_projected) as expen_projected,
                SUM(expen_actual) as expen_actual
              FROM view_expenditure ve
              JOIN contract_award ca on ve.project_id = ca.project_id
              WHERE ca.contract_status = 2
              AND (SELECT DATEDIFF((SELECT CURDATE()), ve.expen_funding_date)) >= 0
              AND ve.project_id IN (${Prisma.join(input.project_ids)})`
            : await prisma.$queryRaw<expenditure[]>`
              SELECT 
                SUM(expen_projected) as expen_projected,
                SUM(expen_actual) as expen_actual
              FROM view_expenditure ve
              JOIN contract_award ca on ve.project_id = ca.project_id
              WHERE ca.contract_status = 2 AND (SELECT DATEDIFF((SELECT CURDATE()), ve.expen_funding_date)) >= 0`
            // Contractors
          : // TODO: add project_id filtering for non-admins
            await prisma.$queryRaw<expenditure[]>`
              SELECT 
                SUM(expen_projected) as expen_projected,
                SUM(expen_actual) as expen_actual
              FROM view_expenditure ve
              JOIN user_project_link upl on ve.project_id = upl.project_id
              JOIN contract_award ca on upl.project_id = ca.project_id
              JOIN users u on upl.user_id = u.id
              WHERE u.id = ${user.id} AND ca.contract_status = 2 AND (SELECT DATEDIFF((SELECT CURDATE()), ve.expen_funding_date)) >= 0`
        ).map((expen) => {
          // Map the query result to numbers (for some reason, the query result is a string)
          return {
            expen_actual: Number(expen.expen_actual || 0),
            expen_projected: Number(expen.expen_projected || 0),
          };
        })[0] || null
      );
    }),
  addExpenditure: protectedProcedure
    .input(
      z.object({
        project_id: z.number(),
        expen_funding_date: z.date(),
        expen_projected: z.number(),
        expen_actual: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.expenditure_funding_data.create({
        data: { ...input },
      });
    }),
  updateExpenditure: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        project_id: z.number(),
        expen_funding_date: z.date(),
        expen_projected: z.number(),
        expen_actual: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.expenditure_funding_data.update({
        where: { id: input.id },
        data: { ...input },
      });
    }),
  deleteExpenditure: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await prisma.expenditure_funding_data.delete({
        where: { id: input.id },
      });
    }),
});
