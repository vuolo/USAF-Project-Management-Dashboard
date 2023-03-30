import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { milestone } from "~/types/milestone";
import type { schedule_summary } from "~/types/schedule_summary";

export const milestoneRouter = createTRPCRouter({
  getSchedules: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.$queryRaw<milestone[]>`
        SELECT 
          pm.id as ID,
          pm.project_id,
          pm.task_name as "Name",
          DATEDIFF(pm.end_date,pm.start_date) as "Duration",
          pm.start_date as "ProjectedStart",
          pm.end_date as "ProjectedEnd",
          pm.actual_start as "ActualStart",
          pm.actual_end as "ActualEnd",
          (
            SELECT 
            GROUP_CONCAT(predecessor_milestone SEPARATOR ',' ) 
            FROM project_milestone_dependency  pmd
            WHERE pmd.successor_milestone = pm.id
            AND pmd.predecessor_project = pmd.successor_project
          ) as "Predecessors",
          (
            SELECT 
            GROUP_CONCAT(pm1.task_name SEPARATOR ',' ) 
            
            FROM project_milestone_dependency  pmd
            INNER JOIN project_milestones pm1 ON pm1.id = pmd.predecessor_milestone
            WHERE pmd.successor_milestone = pm.id
            AND pmd.predecessor_project = pmd.successor_project
          ) as "Predecessors_Name"
            
      FROM project_milestones pm
      WHERE pm.project_id = ${input.project_id}`;
    }),
  getScheduleSummary: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return (
      (user.user_role === "Admin"
        ? await prisma.$queryRaw<schedule_summary[]>`
            SELECT
              (SELECT COUNT(schedule_status) 
                FROM view_project
                WHERE schedule_status= 'ONTRACK' COLLATE utf8mb4_general_ci) as green_sch,
              (SELECT COUNT(schedule_status) 
                FROM view_project
                WHERE schedule_status= 'BEHIND' COLLATE utf8mb4_general_ci) as yellow_sch,
              (SELECT COUNT(schedule_status) 
                FROM view_project
                WHERE schedule_status= 'REALLY-BEHIND' COLLATE utf8mb4_general_ci) as red_sch`
        : await prisma.$queryRaw<schedule_summary[]>`
            SELECT
              (SELECT COUNT(schedule_status) 
                FROM view_project vp
                INNER JOIN user_project_link upl on vp.id = upl.project_id
                WHERE schedule_status= 'ONTRACK' COLLATE utf8mb4_general_ci AND upl.user_id = ${user.id}) as green_sch,
              (SELECT COUNT(schedule_status) 
                FROM view_project vp
                INNER JOIN user_project_link upl on vp.id = upl.project_id
                WHERE schedule_status= 'BEHIND' COLLATE utf8mb4_general_ci AND upl.user_id = ${user.id}) as yellow_sch,
              (SELECT COUNT(schedule_status) 
                FROM view_project vp
                INNER JOIN user_project_link upl on vp.id = upl.project_id
                WHERE schedule_status= 'REALLY-BEHIND' COLLATE utf8mb4_general_ci AND upl.user_id = ${user.id}) as red_sch`)[0] ||
      null
    );
  }),
  addMilestoneSchedule: protectedProcedure
    .input(
      z.object({
        project_id: z.number(),
        task_name: z.string(),
        projected_start: z.date(),
        projected_end: z.date(),
        actual_start: z.date().optional(),
        actual_end: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.project_milestones.create({
        data: {
          project_id: input.project_id,
          task_name: input.task_name,
          start_date: input.projected_start,
          end_date: input.projected_end,
          actual_start: input.actual_start,
          actual_end: input.actual_end,
        },
      });
    }),
  updateMilestoneSchedule: protectedProcedure
    .input(
      z.object({
        milestone_id: z.number(),
        project_id: z.number(),
        task_name: z.string(),
        projected_start: z.date().optional(),
        projected_end: z.date().optional(),
        actual_start: z.date().optional(),
        actual_end: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.project_milestones.update({
        where: {
          id: input.milestone_id,
        },
        data: {
          project_id: input.project_id,
          task_name: input.task_name,
          start_date: input.projected_start,
          end_date: input.projected_end,
          actual_start: input.actual_start,
          actual_end: input.actual_end,
        },
      });
    }),
  deleteMilestoneSchedule: protectedProcedure
    .input(z.object({ milestone_id: z.number() }))
    .mutation(async ({ input }) => {
      return await prisma.project_milestones.delete({
        where: {
          id: input.milestone_id,
        },
      });
    }),
});
