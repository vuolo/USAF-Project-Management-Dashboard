import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { obligation } from "~/types/obligation";

export const obligationRouter = createTRPCRouter({
  getTotalObligation: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      user.user_role === "Admin"
        ? await prisma.$queryRaw<obligation[]>`
            SELECT 
              SUM(obli_projected) as obli_projected,
              SUM(obli_actual) as obli_actual
            FROM view_obligation vo
            JOIN contract_award ca on vo.project_id = ca.project_id
            WHERE ca.contract_status = 2 AND (SELECT DATEDIFF((SELECT CURDATE()), vo.obli_funding_date)) >= 0`
        : // TODO: Add a query for non-admin users
          []
    ).map((obli) => {
      // Map the query result to numbers (for some reason, the query result is a string)
      return {
        obli_actual: Number(obli.obli_actual || 0),
        obli_projected: Number(obli.obli_projected || 0),
      };
    })[0];
  }),
});
