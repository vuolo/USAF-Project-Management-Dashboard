import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { dependency } from "~/types/dependency";

export const dependencyRouter = createTRPCRouter({
  getGreen: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      user.user_role === "Admin"
        ? await prisma.$queryRaw<dependency[]>`
            SELECT COUNT(*) as count
            FROM (
            SELECT
                DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                ) as date_difference
                
                FROM project p
                INNER JOIN project_milestones pm ON pm.project_id = p.id
                INNER JOIN project_milestone_dependency pmd ON pmd.predecessor_milestone = pm.id AND pmd.predecessor_project != pmd.successor_project    
                INNER JOIN project p2 ON p2.id = pmd.successor_project
                INNER JOIN project_milestones pm1 ON pm1.id = pmd.successor_milestone
                WHERE DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                ) > 5
            ) T1`
        : await prisma.$queryRaw<dependency[]>`
            SELECT COUNT(*) as count
            FROM (
            SELECT
                DATEDIFF(
                    IFNULL(pm1.actual_start,pm1.start_date),
                    IFNULL(pm.actual_end,pm.end_date)
                ) as date_difference
                
                FROM project p
                INNER JOIN project_milestones pm ON pm.project_id = p.id
                INNER JOIN project_milestone_dependency pmd ON pmd.predecessor_milestone = pm.id AND pmd.predecessor_project != pmd.successor_project    
                INNER JOIN project p2 ON p2.id = pmd.successor_project
                INNER JOIN project_milestones pm1 ON pm1.id = pmd.successor_milestone
                WHERE p.id IN (SELECT project_id FROM user_project_link WHERE user_id = ${user.id})
                AND DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                ) > 5
            ) T1`
    )[0];
  }),
  getYellow: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      user.user_role === "Admin"
        ? await prisma.$queryRaw<dependency[]>`
            SELECT COUNT(*) as count
            FROM (
            SELECT
                DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                ) as date_difference
                
                FROM project p
                INNER JOIN project_milestones pm ON pm.project_id = p.id
                INNER JOIN project_milestone_dependency pmd ON pmd.predecessor_milestone = pm.id AND pmd.predecessor_project != pmd.successor_project    
                INNER JOIN project p2 ON p2.id = pmd.successor_project
                INNER JOIN project_milestones pm1 ON pm1.id = pmd.successor_milestone
                WHERE DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                ) > 0
                AND DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                ) < 6
            ) T1`
        : await prisma.$queryRaw<dependency[]>`
            SELECT COUNT(*) as count
            FROM (
            SELECT
                DATEDIFF(
                    IFNULL(pm1.actual_start,pm1.start_date),
                    IFNULL(pm.actual_end,pm.end_date)
                ) as date_difference
                
                FROM project p
                INNER JOIN project_milestones pm ON pm.project_id = p.id
                INNER JOIN project_milestone_dependency pmd ON pmd.predecessor_milestone = pm.id AND pmd.predecessor_project != pmd.successor_project    
                INNER JOIN project p2 ON p2.id = pmd.successor_project
                INNER JOIN project_milestones pm1 ON pm1.id = pmd.successor_milestone
                WHERE p.id IN (SELECT project_id FROM user_project_link WHERE user_id = ${user.id})
                AND DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                    ) > 0
                AND DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                    ) < 6
            ) T1`
    )[0];
  }),
  getRed: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      user.user_role === "Admin"
        ? await prisma.$queryRaw<dependency[]>`
            SELECT COUNT(*) as count
            FROM (
              SELECT
                DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                ) as date_difference
                FROM project p
                INNER JOIN project_milestones pm ON pm.project_id = p.id
                INNER JOIN project_milestone_dependency pmd ON pmd.predecessor_milestone = pm.id AND pmd.predecessor_project != pmd.successor_project    
                INNER JOIN project p2 ON p2.id = pmd.successor_project
                INNER JOIN project_milestones pm1 ON pm1.id = pmd.successor_milestone
                WHERE DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                ) < 0
            ) T1`
        : await prisma.$queryRaw<dependency[]>`
            SELECT COUNT(*) as count
            FROM (
            SELECT
                DATEDIFF(
                    IFNULL(pm1.actual_start,pm1.start_date),
                    IFNULL(pm.actual_end,pm.end_date)
                ) as date_difference
                    
                FROM project p
                INNER JOIN project_milestones pm ON pm.project_id = p.id
                INNER JOIN project_milestone_dependency pmd ON pmd.predecessor_milestone = pm.id AND pmd.predecessor_project != pmd.successor_project    
                INNER JOIN project p2 ON p2.id = pmd.successor_project
                INNER JOIN project_milestones pm1 ON pm1.id = pmd.successor_milestone
                WHERE p.id IN (SELECT project_id FROM user_project_link WHERE user_id = ${user.id})
                AND DATEDIFF(
                  IFNULL(pm1.actual_start,pm1.start_date),
                  IFNULL(pm.actual_end,pm.end_date)
                    ) < 0
            ) T1`
    )[0];
  }),
});
