import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type {
  CountedDependency,
  ProjectMilestoneSummary,
  ScheduleSummaryWithProjects,
  milestone,
} from "~/types/milestone";
import type { schedule_summary } from "~/types/schedule_summary";
import { view_project } from "~/types/view_project";
import type { breakpoints } from "~/types/breakpoints";
import { milestonebulk_ext } from "./milestone_bulk";

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
    const user = ctx.session?.db_user;
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
  getScheduleSummaryWithProjects: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.db_user;
    if (!user) return null;

    // Get all viewable projects
    const projects =
      user.user_role === "Admin" || user.user_role === "IPT_Member"
        ? await prisma.$queryRaw<view_project[]>`SELECT * FROM view_project`
        : // Contractors
          await prisma.$queryRaw<view_project[]>`
          SELECT * 
          FROM view_project vp
          WHERE vp.contractor_id = ${user.contractor_id}
          ORDER BY vp.id ASC`;
    if (!projects) return null;

    // Get all project milestones that are not completed (actual_end is null)
    const projectMilestones = await prisma.project_milestones.findMany({
      where: {
        actual_end: null,
      },
      orderBy: {
        end_date: "asc",
      },
    });
    if (!projectMilestones) return null;

    const generateProjectSummary = (project: view_project) => {
      // Filter milestones specific to the current project
      const milestonesForProject = projectMilestones.filter(
        (milestone) => milestone.project_id === project.id
      );
      // Get the earliest milestone for the current project
      const earliestMilestone = milestonesForProject[0];

      let diff = 0;
      if (earliestMilestone?.end_date) {
        // Example earliestMilestone.end_date: 2023-02-28T00:00:00.000Z,
        // Get the difference between today and the milestone's end date (in days, where if the milestone is behind, the difference will be negative)
        const milestoneEndDate = new Date(earliestMilestone.end_date);
        const today = new Date();
        milestoneEndDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        diff = Math.floor(
          (today.getTime() - milestoneEndDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        ...project,
        date_difference: diff,
        earliest_milestone_name: earliestMilestone?.task_name || null,
        earliest_milestone_date: earliestMilestone?.end_date || null,
      } as ProjectMilestoneSummary;
    };

    return {
      greenProjects: projects
        .filter((project) => project.schedule_status === "ONTRACK")
        .map(generateProjectSummary),
      yellowProjects: projects
        .filter((project) => project.schedule_status === "BEHIND")
        .map(generateProjectSummary),
      redProjects: projects
        .filter((project) => project.schedule_status === "REALLY-BEHIND")
        .map(generateProjectSummary),
    } as ScheduleSummaryWithProjects;
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
  ...milestonebulk_ext,
});
