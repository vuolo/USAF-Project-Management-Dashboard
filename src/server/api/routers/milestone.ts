import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { schedule_summary } from "~/types/schedule_summary";

export const milestoneRouter = createTRPCRouter({
  getScheduleSummary: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      user.user_role === "Admin"
        ? await prisma.$queryRaw<schedule_summary[]>`
            SELECT
              (SELECT COUNT(schedule_status) 
                FROM view_project
                WHERE schedule_status= 'ONTRACK') as green_sch,
              (SELECT COUNT(schedule_status) 
                FROM view_project
                WHERE schedule_status= 'BEHIND') as yellow_sch,
              (SELECT COUNT(schedule_status) 
                FROM view_project
                WHERE schedule_status= 'REALLY-BEHIND') as red_sch`
        : await prisma.$queryRaw<schedule_summary[]>`
            SELECT
              (SELECT COUNT(schedule_status) 
                FROM view_project vp
                INNER JOIN user_project_link upl on vp.id = upl.project_id
                WHERE schedule_status= 'ONTRACK' AND upl.user_id = ${user.id}) as green_sch,
              (SELECT COUNT(schedule_status) 
                FROM view_project vp
                INNER JOIN user_project_link upl on vp.id = upl.project_id
                WHERE schedule_status= 'BEHIND' AND upl.user_id = ${user.id}) as yellow_sch,
              (SELECT COUNT(schedule_status) 
                FROM view_project vp
                INNER JOIN user_project_link upl on vp.id = upl.project_id
                WHERE schedule_status= 'REALLY-BEHIND' AND upl.user_id = ${user.id}) as red_sch`
    )[0];
  }),
});
