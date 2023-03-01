import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { expenditure } from "~/types/expenditure";

export const expenditureRouter = createTRPCRouter({
  getTotalExpenditure: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      user.user_role === "Admin"
        ? await prisma.$queryRaw<expenditure[]>`
            SELECT 
              SUM(expen_projected) as expen_projected,
              SUM(expen_actual) as expen_actual
            FROM view_expenditure ve
            JOIN contract_award ca on ve.project_id = ca.project_id
            WHERE ca.contract_status = 2 AND (SELECT DATEDIFF((SELECT CURDATE()), ve.expen_funding_date)) >= 0`
        : // TODO: Add a query for non-admin users
          []
    ).map((expen) => {
      // Map the query result to numbers (for some reason, the query result is a string)
      return {
        expen_actual: Number(expen.expen_actual || 0),
        expen_projected: Number(expen.expen_projected || 0),
      };
    })[0];
  }),
});
