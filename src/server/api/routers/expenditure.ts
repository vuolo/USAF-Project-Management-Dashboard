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
  getTotalExpenditure: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      (user.user_role === "Admin"
        ? await prisma.$queryRaw<expenditure[]>`
            SELECT 
              SUM(expen_projected) as expen_projected,
              SUM(expen_actual) as expen_actual
            FROM view_expenditure ve
            JOIN contract_award ca on ve.project_id = ca.project_id
            WHERE ca.contract_status = 2 AND (SELECT DATEDIFF((SELECT CURDATE()), ve.expen_funding_date)) >= 0`
        : await prisma.$queryRaw<expenditure[]>`
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
});
