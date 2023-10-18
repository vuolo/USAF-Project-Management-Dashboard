import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { users } from "@prisma/client";
import type { ipt_members } from "~/types/ipt_members";
import { view_project } from "~/types/view_project";
import { getIPTMembers } from "~/utils/iptMembers";

export const project_ext = {
  getProjectsWithUpcomingDueMilestones: protectedProcedure.input(z.object({
    days: z.number().optional().default(7),
    favorites: z.boolean().optional(),
    allProjects: z.boolean().optional().default(false)
  })).query(async ({ input, ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    const isAdmin = user.user_role == "Admin";

    const currentDate = new Date();
    const nextDate = new Date();
    nextDate.setDate(currentDate.getDate() + input.days);

    const projects = await prisma.project.findMany({
      where: {
        project_milestones: {
          some: {
            end_date: {
              gte: currentDate,
              lte: nextDate
            }
          }
        },
        favorites: input.favorites ? {
          some: {
            userId: user.id
          }
        } : undefined,
      },
      select: {
        id: true,
        project_name: true,
        project_milestones: true,
      },
    });

    let final: {
      id: number;
      project_name: string | null;
      project_milestones: {
        id: number;
        project_id: number | null;
        task_name: string;
        start_date: Date | null;
        end_date: Date | null;
        actual_start: Date | null;
        actual_end: Date | null;
      }[];
    }[] = [];

    await Promise.all(projects.map(async (project) => {
      if (isAdmin)
        final.push({
          ...project,
          project_milestones: project.project_milestones.filter((milestone) => {
            if (!milestone.end_date) return false;
            return milestone.end_date >= currentDate && milestone.end_date <= nextDate;
          })
        });
      const iptMembers = await getIPTMembers(project.id);
      const isMember = iptMembers.find(m => m.id === user.id) ? true : false;
      if (isMember) {
        final.push({
          ...project,
          project_milestones: project.project_milestones.filter((milestone) => {
            if (!milestone.end_date) return false;
            return milestone.end_date >= currentDate && milestone.end_date <= nextDate;
          })
        });
      }
    }));
    return final;
  })
}
