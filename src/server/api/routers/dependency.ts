import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { all_successors } from "~/types/all_successors";
import type { dependency } from "~/types/dependency";
import type { predecessor } from "~/types/predecessor";
import type { successor } from "~/types/successor";

export const dependencyRouter = createTRPCRouter({
  addDependency: protectedProcedure
    .input(
      z.object({
        predecessor_project: z.number(),
        predecessor_milestone: z.number(),
        successor_project: z.number(),
        successor_milestone: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.$executeRaw`
        INSERT INTO project_milestone_dependency (
          predecessor_project, 
          predecessor_milestone,
          successor_project,
          successor_milestone) 
        VALUES (
          ${input.predecessor_project},
          ${input.predecessor_milestone},
          ${input.successor_project},
          ${input.successor_milestone})`;
    }),
  removeDependency: protectedProcedure
    .input(
      z.object({
        predecessor_project: z.number(),
        predecessor_milestone: z.number(),
        successor_project: z.number(),
        successor_milestone: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.$executeRaw`
        DELETE FROM project_milestone_dependency
        WHERE predecessor_project = ${input.predecessor_project}
        AND predecessor_milestone = ${input.predecessor_milestone}
        AND successor_project = ${input.successor_project}
        AND successor_milestone = ${input.successor_milestone}`;
    }),
  getAllSuccessors: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return user.user_role === "Admin"
      ? await prisma.$queryRaw<all_successors[]>`
          SELECT
            p.project_name as pred_proj_name,
            pm.task_name as pred_name,
            pm.start_date as pred_proj_start,
            pm.end_date as pred_proj_end,
            pm.actual_start as pred_actual_start,
            pm.actual_end as pred_actual_end,

            p2.project_name as succ_proj_name,
            pm1.task_name as succ_name,
            pm1.start_date as succ_proj_start,
            pm1.end_date as succ_proj_end,
            pm1.actual_start as succ_actual_start,
            pm1.actual_end as succ_actual_end
          
          FROM project p
          INNER JOIN project_milestones pm ON pm.project_id = p.id
          INNER JOIN project_milestone_dependency pmd ON pmd.predecessor_milestone = pm.id AND pmd.predecessor_project != pmd.successor_project    
          INNER JOIN project p2 ON p2.id = pmd.successor_project
          INNER JOIN project_milestones pm1 ON pm1.id = pmd.successor_milestone`
      : await prisma.$queryRaw<all_successors[]>`
      SELECT
        p.project_name as pred_proj_name,
        pm.task_name as pred_name,
        pm.start_date as pred_proj_start,
        pm.end_date as pred_proj_end,
        pm.actual_start as pred_actual_start,
        pm.actual_end as pred_actual_end,
                
        p2.project_name as succ_proj_name,
        pm1.task_name as succ_name,
        pm1.start_date as succ_proj_start,
        pm1.end_date as succ_proj_end,
        pm1.actual_start as succ_actual_start,
        pm1.actual_end as succ_actual_end
            
        FROM project p
        INNER JOIN project_milestones pm ON pm.project_id = p.id
        INNER JOIN project_milestone_dependency pmd ON pmd.predecessor_milestone = pm.id AND pmd.predecessor_project != pmd.successor_project    
        INNER JOIN project p2 ON p2.id = pmd.successor_project
        INNER JOIN project_milestones pm1 ON pm1.id = pmd.successor_milestone
        WHERE p.id IN (SELECT project_id FROM user_project_link WHERE user_id = ${user.id})`;
  }),
  getPredecessors: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.$queryRaw<predecessor[]>`
        SELECT
          pmd.predecessor_project,
          p1.project_name as predecessor_name,
          pmd.predecessor_milestone,
          pm1.task_name as predecessor_task_name,
          pm1.end_date as predecessor_task_end_date,
          
          pmd.successor_project,
          p2.project_name as dep_proj_name,
          pmd.successor_milestone,
          pm2.task_name as successor_task_name,
          pm2.start_date as successor_task_start_date
      
        FROM project_milestone_dependency pmd

        INNER JOIN project p1 ON p1.id = pmd.predecessor_project
        INNER JOIN project_milestones pm1 ON pm1.id = pmd.predecessor_milestone

        INNER JOIN project p2 ON p2.id = pmd.successor_project
        INNER JOIN project_milestones pm2 ON pm2.id = pmd.successor_milestone

        WHERE pmd.successor_project = ${input.project_id} 
        AND pmd.predecessor_project != pmd.successor_project`;
    }),
  getSuccessors: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.$queryRaw<successor[]>`
        SELECT 
            pmd.predecessor_project,
            p1.project_name as predecessor_name,
            pmd.predecessor_milestone,
            pm1.task_name as predecessor_task_name,
            pm1.end_date as predecessor_task_end_date,
            
            pmd.successor_project,
            p2.project_name as succ_proj_name,
            pmd.successor_milestone,
            pm2.task_name as successor_task_name,
            pm2.start_date as successor_task_start_date
      
        FROM project_milestone_dependency pmd
    
        INNER JOIN project p1 ON p1.id = pmd.predecessor_project
        INNER JOIN project_milestones pm1 ON pm1.id = pmd.predecessor_milestone
    
        INNER JOIN project p2 ON p2.id = pmd.successor_project
        INNER JOIN project_milestones pm2 ON pm2.id = pmd.successor_milestone
    
        WHERE pmd.predecessor_project = ${input.project_id} 
        AND pmd.predecessor_project != pmd.successor_project`;
    }),
  getGreen: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      (user.user_role === "Admin"
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
            ) T1`)[0] || null
    );
  }),
  getYellow: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      (user.user_role === "Admin"
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
            ) T1`)[0] || null
    );
  }),
  getRed: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      (user.user_role === "Admin"
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
            ) T1`)[0] || null
    );
  }),
});
